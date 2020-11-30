import Ember from 'ember';
import { later, run, scheduleOnce } from '@ember/runloop';
import Component from '@ember/component';
import {
  settled,
  setupContext,
  setupRenderingContext,
  teardownContext,
  find,
  click,
  render,
  isSettled,
  getSettledState,
} from '@ember/test-helpers';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import Pretender from 'pretender';
import ajax from '../helpers/ajax';

const TestComponent1 = Component.extend({
  layout: hbs`{{internalValue}}`,

  internalValue: 'initial value',

  init() {
    this._super.apply(this, arguments);

    later(this, () => this.set('internalValue', 'async value'), 10);
  },
});

const TestComponent2 = Component.extend({
  layout: hbs`<div class="test-component">{{internalValue}}</div>`,

  internalValue: 'initial value',

  click() {
    later(this, () => this.set('internalValue', 'async value'), 10);
  },
});

const TestComponent3 = Component.extend({
  layout: hbs`<div class="test-component">{{internalValue}}</div>`,

  internalValue: '',

  click() {
    ajax('/whazzits').then(data => {
      let value = this.get('internalValue');

      run(this, 'set', 'internalValue', value + data);
    });
  },
});

const TestComponent4 = Component.extend({
  layout: hbs`<div class="test-component">{{internalValue}}</div>`,

  internalValue: '',

  click() {
    later(() => run(this, 'set', 'internalValue', 'Local Data!'), 10);

    ajax('/whazzits').then(data => {
      let value = this.get('internalValue');

      run(this, 'set', 'internalValue', value + data);

      later(() => {
        ajax('/whazzits').then(data => {
          if (this.isDestroyed) {
            return;
          }

          let value = this.get('internalValue');

          run(this, 'set', 'internalValue', value + data);
        });
      }, 15);
    });
  },
});

const TestComponent5 = Component.extend({
  layout: hbs`{{internalValue}}`,

  internalValue: 'initial value',

  ready: false,

  isReady() {
    return this.get('ready');
  },

  init() {
    this._super.apply(this, arguments);
    // In Ember < 2.8 `registerWaiter` expected to be bound to
    // `Ember.Test` 😭
    //
    // Once we have dropped support for < 2.8 we should swap this to
    // use:
    //
    // import { registerWaiter } from '@ember/test';
    Ember.Test.registerWaiter(this, this.isReady);
    later(() => {
      this.setProperties({
        internalValue: 'async value',
        ready: true,
      });
    }, 25);
  },

  willDestroy() {
    this._super.apply(this, arguments);
    // must be called with `Ember.Test` as context for Ember < 2.8
    Ember.Test.unregisterWaiter(this, this.isReady);
  },
});

const TestComponent6 = Component.extend({
  layout: hbs`<section>
  <button data-test-search-trigger onclick={{action "showSearch"}}>Search</button>
    {{#if this.showSearch}}
      <input id="search-input" data-test-search-input type="search"/>
    {{/if}}
  </section>`,

  init() {
    this._super(...arguments);

    QUnit.config.current.testEnvironment.c = this;
  },

  applyFocus() {
    QUnit.config.current.assert.step('Applying focus');

    let input = this.element.querySelector('#search-input');

    if (input) {
      input.focus();
    }
  },

  actions: {
    showSearch() {
      QUnit.config.current.assert.step('In showSearch action');
      this.set('showSearch', true);
      scheduleOnce('afterRender', this, this.applyFocus);
    },
  },
});

module('settled real-world scenarios', function (hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  hooks.beforeEach(async function () {
    await setupContext(this);
    await setupRenderingContext(this);

    this.server = new Pretender(function () {
      this.get(
        '/whazzits',
        function () {
          return [200, { 'Content-Type': 'text/plain' }, 'Remote Data!'];
        },
        25
      );
    });
  });

  hooks.afterEach(async function () {
    await settled();

    this.server.shutdown();

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

  test('it waits for AJAX requests to finish', async function (assert) {
    this.owner.register('component:x-test-3', TestComponent3);

    await render(hbs`{{x-test-3}}`);

    await click('.test-component');

    assert.equal(this.element.textContent, 'Remote Data!');
  });

  test('it waits for interleaved AJAX and run loops to finish', async function (assert) {
    this.owner.register('component:x-test-4', TestComponent4);

    await render(hbs`{{x-test-4}}`);

    await click('.test-component');

    assert.equal(this.element.textContent, 'Local Data!Remote Data!Remote Data!');
  });

  test('it waits for Ember test waiters', async function (assert) {
    this.owner.register('component:x-test-5', TestComponent5);

    await render(hbs`{{x-test-5}}`);

    await settled({ waitForTimers: false });

    assert.equal(this.element.textContent, 'async value');
  });

  test('it correctly waits for settled state during render', async function (assert) {
    let done = assert.async();

    console.log('IN THE FUCKING TEST');
    this.owner.register('component:basic-search', TestComponent6);

    await render(hbs`{{basic-search}}`);
    console.log('Am i settled? ', isSettled());
    Ember.run(() => {});

    assert.step('In showSearch action');
    this.c.set('showSearch', true);
    console.log(Ember.run.backburner.getDebugInfo());
    scheduleOnce('afterRender', () => {
      assert.step('Applying focus');

      let input = this.element.querySelector('#search-input');

      console.log(Ember.run.backburner.getDebugInfo());

      if (input) {
        input.focus();
      } else {
        debugger;
        console.log('Rob sucks');
      }
    });
    console.log(Ember.run.backburner.getDebugInfo());
    await settled();

    // await click('[data-test-search-trigger]');

    assert.ok(find('[data-test-search-input]'), 'Search input element exists');

    setTimeout(() => {
      assert.ok(
        find('[data-test-search-input]') === document.activeElement,
        'Search input element does not have focus'
      );

      done();
    }, 10);
    assert.verifySteps(['In showSearch action', 'Applying focus']);
  });
});
