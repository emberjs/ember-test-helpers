import { later } from '@ember/runloop';
import { registerWaiter, unregisterWaiter } from '@ember/test';
import Component from '@ember/component';
import {
  settled,
  setupContext,
  setupRenderingContext,
  teardownContext,
  click,
  isSettled,
  getSettledState,
  render,
  rerender,
} from '@ember/test-helpers';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';

const TestComponent1 = Component.extend({
  layout: hbs`{{this.internalValue}}`,

  internalValue: 'initial value',

  init() {
    this._super.apply(this, arguments);

    later(this, () => this.set('internalValue', 'async value'), 10);
  },
});

const TestComponent2 = Component.extend({
  layout: hbs`<div class="test-component">{{this.internalValue}}</div>`,

  internalValue: 'initial value',

  click() {
    later(this, () => this.set('internalValue', 'async value'), 10);
  },
});

const TestComponent5 = Component.extend({
  layout: hbs`{{this.internalValue}}`,

  internalValue: 'initial value',

  ready: false,

  isReady() {
    return this.get('ready');
  },

  init() {
    this._super.apply(this, arguments);
    registerWaiter(this, this.isReady);
    later(() => {
      this.setProperties({
        internalValue: 'async value',
        ready: true,
      });
    }, 25);
  },

  willDestroy() {
    this._super.apply(this, arguments);
    unregisterWaiter(this, this.isReady);
  },
});

module('settled real-world scenarios', function (hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  hooks.beforeEach(async function () {
    await setupContext(this);
    await setupRenderingContext(this);
  });

  hooks.afterEach(async function () {
    await settled();
    await teardownContext(this);
  });

  test('basic behavior', async function (assert) {
    await settled();

    assert.ok(
      isSettled(),
      `should be settled after awaiting: ${JSON.stringify(getSettledState())}`
    );
  });

  test('it works when async exists in `init`', async function (assert) {
    this.owner.register('component:x-test-1', TestComponent1);

    await render(hbs`{{x-test-1}}`);
    await settled();

    assert.equal(this.element.textContent, 'async value');
  });

  test('rerender - it basically works', async function (assert) {
    this.owner.register('component:x-test-1', TestComponent1);

    let renderPromise = render(hbs`{{x-test-1}}`);
    await rerender();

    assert.equal(this.element.textContent, 'initial value');

    await renderPromise;
  });

  test('does not error for various argument types', async function (assert) {
    assert.expect(0); // no assertions, just shouldn't error

    await settled(3000);
    await settled(null);
    await settled(undefined);
    await settled();
  });

  test('it works when async exists in an event/action', async function (assert) {
    this.owner.register('component:x-test-2', TestComponent2);

    await render(hbs`{{x-test-2}}`);

    assert.equal(this.element.textContent, 'initial value');

    await click('.test-component');

    assert.equal(this.element.textContent, 'async value');
  });

  test('it waits for Ember test waiters', async function (assert) {
    this.owner.register('component:x-test-5', TestComponent5);

    await render(hbs`{{x-test-5}}`);

    await settled({ waitForTimers: false });

    assert.equal(this.element.textContent, 'async value');
  });
});
