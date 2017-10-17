import { module, test, skip } from 'qunit';
import Service from '@ember/service';
import Component from '@ember/component';
import TextField from '@ember/component/text-field';
import { helper } from '@ember/component/helper';
import {
  setupContext,
  setupRenderingContext,
  teardownContext,
  teardownRenderingContext,
} from 'ember-test-helpers';
import hasEmberVersion from 'ember-test-helpers/has-ember-version';
import hasjQuery from '../helpers/has-jquery';
import { setResolverRegistry } from '../helpers/resolver';
import { focus, blur, fireEvent, click } from '../helpers/events';
import hbs from 'htmlbars-inline-precompile';

module('setupRenderingContext', function(hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  hooks.beforeEach(function() {
    setResolverRegistry({
      'service:foo': Service.extend({ isFoo: true }),
      'template:components/template-only': hbs`template-only component here`,
      'component:js-only': Component.extend({
        classNames: ['js-only'],
      }),
      'helper:jax': helper(([name]) => `${name}-jax`),
      'template:components/outer-comp': hbs`outer{{inner-comp}}outer`,
      'template:components/inner-comp': hbs`inner`,
    });

    setupContext(this);
    setupRenderingContext(this);
  });

  hooks.afterEach(function() {
    teardownContext(this);
    teardownRenderingContext(this);
  });

  test('render exposes an `.element` property', async function(assert) {
    await this.render(hbs`<p>Hello!</p>`);

    assert.equal(this.element.textContent, 'Hello!');
  });

  test('render can be used multiple times', async function(assert) {
    await this.render(hbs`<p>Hello!</p>`);
    assert.equal(this.element.textContent, 'Hello!');

    await this.render(hbs`<p>World!</p>`);
    assert.equal(this.element.textContent, 'World!');
  });

  test('render does not run sync', async function(assert) {
    assert.equal(this.element, undefined, 'precond - this.element is not set before this.render');

    let renderPromise = this.render(hbs`<p>Hello!</p>`);

    assert.equal(this.element, undefined, 'precond - this.element is not set sync');

    await renderPromise;
    assert.equal(this.element.textContent, 'Hello!');
  });

  test('clearRender can be used to clear the previously rendered template', async function(assert) {
    let testingRootElement = document.getElementById('ember-testing');

    await this.render(hbs`<p>Hello!</p>`);

    assert.equal(this.element.textContent, 'Hello!', 'has rendered content');
    assert.equal(testingRootElement.textContent, 'Hello!', 'has rendered content');

    await this.clearRender();
    assert.equal(this.element, undefined, 'this.element is reset');

    assert.equal(testingRootElement.textContent, '', 'content is cleared');
  });

  (hasjQuery() ? test : skip)('this.$ is exposed when jQuery is present', async function(assert) {
    await this.render(hbs`<p>Hello!</p>`);

    assert.equal(this.$().text(), 'Hello!');
  });

  test('can invoke template only components', async function(assert) {
    await this.render(hbs`{{template-only}}`);

    assert.equal(this.element.textContent, 'template-only component here');
  });

  test('can invoke JS only components', async function(assert) {
    await this.render(hbs`{{js-only}}`);

    assert.ok(this.element.querySelector('.js-only'), 'element found for js-only component');
  });

  test('can invoke helper', async function(assert) {
    await this.render(hbs`{{jax "max"}}`);

    assert.equal(this.element.textContent, 'max-jax');
  });

  test('can pass arguments to helper from context', async function(assert) {
    this.set('name', 'james');

    await this.render(hbs`{{jax name}}`);

    assert.equal(this.element.textContent, 'james-jax');
  });

  test('can render a component that renders other components', async function(assert) {
    await this.render(hbs`{{outer-comp}}`);

    assert.equal(this.element.textContent, 'outerinnerouter');
  });

  test('can use the component helper in its layout', async function(assert) {
    this.owner.register('template:components/x-foo', hbs`x-foo here`);

    await this.render(hbs`{{component 'x-foo'}}`);

    assert.equal(this.element.textContent, 'x-foo here');
  });

  test('can create a component instance for direct testing without a template', function(assert) {
    this.owner.register(
      'component:foo-bar',
      Component.extend({
        someMethod() {
          return 'hello thar!';
        },
      })
    );

    let subject;
    if (hasEmberVersion(2, 12)) {
      subject = this.owner.lookup('component:foo-bar');
    } else {
      subject = this.owner._lookupFactory('component:foo-bar').create();
    }

    assert.equal(subject.someMethod(), 'hello thar!');
  });

  test('can handle a click event', async function(assert) {
    assert.expect(2);

    this.owner.register(
      'component:x-foo',
      Component.extend({
        click() {
          assert.ok(true, 'click was fired');
        },
      })
    );
    this.owner.register('template:components/x-foo', hbs`<button>Click me!</button>`);

    await this.render(hbs`{{x-foo}}`);

    assert.equal(this.element.textContent, 'Click me!', 'precond - component was rendered');
    click(this.element.querySelector('button'));
  });

  test('can use action based event handling', async function(assert) {
    assert.expect(2);

    this.owner.register(
      'component:x-foo',
      Component.extend({
        actions: {
          clicked() {
            assert.ok(true, 'click was fired');
          },
        },
      })
    );
    this.owner.register(
      'template:components/x-foo',
      hbs`<button {{action 'clicked'}}>Click me!</button>`
    );

    await this.render(hbs`{{x-foo}}`);

    assert.equal(this.element.textContent, 'Click me!', 'precond - component was rendered');
    click(this.element.querySelector('button'));
  });

  test('can pass function to be used as a "closure action"', async function(assert) {
    assert.expect(2);

    this.owner.register(
      'template:components/x-foo',
      hbs`<button onclick={{action clicked}}>Click me!</button>`
    );

    this.set('clicked', () => assert.ok(true, 'action was triggered'));
    await this.render(hbs`{{x-foo clicked=clicked}}`);

    assert.equal(this.element.textContent, 'Click me!', 'precond - component was rendered');
    click(this.element.querySelector('button'));
  });

  test('can update a passed in argument with an <input>', async function(assert) {
    this.owner.register('component:my-input', TextField.extend({}));

    await this.render(hbs`{{my-input value=value}}`);

    let input = this.element.querySelector('input');

    assert.strictEqual(this.get('value'), undefined, 'precond - property is initially null');
    assert.equal(input.value, '', 'precond - element value is initially empty');

    // trigger the change
    input.value = '1';
    fireEvent(input, 'change');

    assert.equal(this.get('value'), '1');
  });

  test('it supports dom triggered focus events', async function(assert) {
    this.owner.register(
      'component:my-input',
      TextField.extend({
        init() {
          this._super(...arguments);

          this.set('value', 'init');
        },
        focusIn() {
          this.set('value', 'focusin');
        },
        focusOut() {
          this.set('value', 'focusout');
        },
      })
    );
    await this.render(hbs`{{my-input}}`);

    let input = this.element.querySelector('input');
    assert.equal(input.value, 'init');

    focus(input);
    assert.equal(input.value, 'focusin');

    blur(input);
    assert.equal(input.value, 'focusout');
  });

  test('two way bound arguments are updated', async function(assert) {
    this.owner.register(
      'component:my-component',
      Component.extend({
        actions: {
          clicked() {
            this.set('foo', 'updated!');
          },
        },
      })
    );
    this.owner.register(
      'template:components/my-component',
      hbs`<button {{action 'clicked'}}>{{foo}}</button>`
    );

    this.set('foo', 'original');
    await this.render(hbs`{{my-component foo=foo}}`);
    assert.equal(this.element.textContent, 'original', 'value after initial render');

    click(this.element.querySelector('button'));
    assert.equal(this.element.textContent, 'updated!', 'value after updating');
    assert.equal(this.get('foo'), 'updated!');
  });

  test('two way bound arguments are available after clearRender is called', async function(assert) {
    this.owner.register(
      'component:my-component',
      Component.extend({
        actions: {
          clicked() {
            this.set('foo', 'updated!');
            this.set('bar', 'updated bar!');
          },
        },
      })
    );
    this.owner.register(
      'template:components/my-component',
      hbs`<button {{action 'clicked'}}>{{foo}}</button>`
    );

    // using two arguments here to ensure the two way binding
    // works both for things rendered in the component's layout
    // and those only used in the components JS file
    await this.render(hbs`{{my-component foo=foo bar=bar}}`);
    click(this.element.querySelector('button'));

    await this.clearRender();

    assert.equal(this.get('foo'), 'updated!');
    assert.equal(this.get('bar'), 'updated bar!');
  });
});
