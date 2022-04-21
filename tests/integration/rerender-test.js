import { setComponentTemplate } from '@ember/component';
import templateOnly from '@ember/component/template-only';
import { precompileTemplate } from '@ember/template-compilation';
import {
  find,
  getSettledState,
  render,
  rerender,
  setupContext,
  setupRenderingContext,
  teardownContext,
  waitFor,
} from '@ember/test-helpers';
import { buildWaiter } from '@ember/test-waiters';
import GlimmerComponent from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';

module('rerender real-world', function (hooks) {
  // this test requires Ember 3.25 in order to use lexically scoped values in templates
  if (!hasEmberVersion(3, 25)) {
    return;
  }
  hooks.beforeEach(async function () {
    await setupContext(this);
    await setupRenderingContext(this);
  });
  hooks.afterEach(async function () {
    await teardownContext(this);
  });

  test('using rerender to test loading states works', async function (assert) {
    let waiter = buildWaiter('test:wat');
    let token;
    let deferredResolve;
    let promise;

    class MyComponent extends GlimmerComponent {
      @tracked value = 'not started';

      constructor() {
        super(...arguments);

        promise = new Promise((resolve) => {
          deferredResolve = resolve;
          this.value = 'loading';
          token = waiter.beginAsync();
        });

        promise.then(() => {
          waiter.endAsync(token);
          this.value = 'done';
        });
      }
    }

    setComponentTemplate(
      hbs`<div data-test-content>The profile for {{@name}} is {{this.value}}</div>`,
      MyComponent
    );

    class Person {
      @tracked name = 'Zoey';
    }
    const somePerson = new Person();

    const template = precompileTemplate(
      '<MyComponent @name={{somePerson.name}} />',
      {
        scope() {
          return {
            somePerson,
            MyComponent,
          };
        },
      }
    );

    const component = setComponentTemplate(template, templateOnly());

    const renderPromise = render(component);

    // No actual render
    assert.equal(
      this.element.textContent,
      '',
      'precond - Nothing on the screen yet'
    );

    // This lets us wait for rendering to actually occur without resolving the render promise itself.
    // This way, we can make assertions about the initial state while also keeping the settled state
    // suspended
    await waitFor('[data-test-content]');
    const element = find('[data-test-content]');

    assert.equal(
      element.textContent,
      'The profile for Zoey is loading',
      'initial render'
    );

    // updated the person's name to trigger a rerender
    somePerson.name = 'Tomster';

    // Same logic as render before. We hold on to this promise so we can control when to actually
    // unwind the render-specific parts of settled state
    const rerenderPromise = rerender();

    assert.equal(
      this.element.textContent,
      'The profile for Zoey is loading',
      'after rerender'
    );

    let settledState = getSettledState();

    // At this point, we've got both render and rerender suspended, so settled state should reflect
    // that there is a render pending AND that the waiter that got kicked off in the component's
    // constructor is pending
    assert.equal(
      settledState.isRenderPending,
      true,
      'ensure isRenderPending is true'
    );
    assert.equal(
      settledState.hasPendingWaiters,
      true,
      'ensure test harness / setup is working -- test waiter is pending'
    );

    // This should resolve isRenderPending but not affect the waiters at all since rerender only
    // waits on pending render operations. **The point of this whole test is basically to prove that
    // this is true**.
    await rerenderPromise;

    assert.equal(
      this.element.textContent,
      'The profile for Tomster is loading',
      'resolve rerender'
    );
    settledState = getSettledState();

    assert.equal(settledState.isRenderPending, false);
    assert.equal(settledState.hasPendingWaiters, true);

    await deferredResolve();

    settledState = getSettledState();

    // We've cleared the waiter, which will update the component's state and trigger another rerender
    assert.equal(settledState.isRenderPending, true, 'render is pending');
    assert.equal(settledState.hasPendingWaiters, false, 'no pending waiters');

    // Finally, let the initial render promise resolve and assert that everything is settled.
    await renderPromise;

    settledState = getSettledState();

    assert.equal(settledState.isRenderPending, false, 'render is not pending');
    assert.equal(settledState.hasPendingWaiters, false, 'no pending waiters');
    assert.equal(this.element.textContent, 'The profile for Tomster is done');
  });
});
