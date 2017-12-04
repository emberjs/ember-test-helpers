import Ember from 'ember';
import { later, run } from '@ember/runloop';
import Component from '@ember/component';
import {
  settled,
  setupContext,
  setupRenderingContext,
  teardownContext,
  teardownRenderingContext,
} from 'ember-test-helpers';
import hasEmberVersion from 'ember-test-helpers/has-ember-version';
import { module, test, skip } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import Pretender from 'pretender';
import { fireEvent } from '../helpers/events';
import hasjQuery from '../helpers/has-jquery';
import ajax from '../helpers/ajax';

module('settled real-world scenarios', function(hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  hooks.beforeEach(async function() {
    await setupContext(this);
    await setupRenderingContext(this);

    let { owner } = this;

    owner.register(
      'component:x-test-1',
      Component.extend({
        internalValue: 'initial value',

        init() {
          this._super.apply(this, arguments);

          later(
            this,
            function() {
              this.set('internalValue', 'async value');
            },
            10
          );
        },
      })
    );

    owner.register('template:components/x-test-1', hbs`{{internalValue}}`);

    owner.register(
      'component:x-test-2',
      Component.extend({
        internalValue: 'initial value',

        click() {
          later(
            this,
            function() {
              this.set('internalValue', 'async value');
            },
            10
          );
        },
      })
    );

    owner.register('template:components/x-test-2', hbs`{{internalValue}}`);

    owner.register(
      'component:x-test-3',
      Component.extend({
        internalValue: '',

        click() {
          var component = this;

          ajax('/whazzits').then(function(data) {
            var value = component.get('internalValue');

            run(component, 'set', 'internalValue', value + data);
          });
        },
      })
    );

    owner.register('template:components/x-test-3', hbs`{{internalValue}}`);

    owner.register(
      'component:x-test-4',
      Component.extend({
        internalValue: '',

        click() {
          var component = this;

          later(function() {
            run(component, 'set', 'internalValue', 'Local Data!');
          }, 10);

          ajax('/whazzits').then(function(data) {
            var value = component.get('internalValue');

            run(component, 'set', 'internalValue', value + data);

            later(function() {
              ajax('/whazzits').then(function(data) {
                if (component.isDestroyed) {
                  return;
                }

                var value = component.get('internalValue');

                run(component, 'set', 'internalValue', value + data);
              });
            }, 15);
          });
        },
      })
    );

    owner.register('template:components/x-test-4', hbs`{{internalValue}}`);

    owner.register(
      'component:x-test-5',
      Component.extend({
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
      })
    );

    owner.register('template:components/x-test-5', hbs`{{internalValue}}`);

    this.server = new Pretender(function() {
      this.get(
        '/whazzits',
        function() {
          return [200, { 'Content-Type': 'text/plain' }, 'Remote Data!'];
        },
        25
      );
    });
  });

  hooks.afterEach(async function() {
    this.server.shutdown();
    await settled();

    await teardownRenderingContext(this);
    await teardownContext(this);
  });

  test('it works when async exists in `init`', async function(assert) {
    await this.render(hbs`{{x-test-1}}`);

    await settled();

    assert.equal(this.element.textContent, 'async value');
  });

  test('it works when async exists in an event/action', async function(assert) {
    await this.render(hbs`{{x-test-2}}`);

    assert.equal(this.element.textContent, 'initial value');

    fireEvent(this.element.querySelector('div'), 'click');

    await settled();

    assert.equal(this.element.textContent, 'async value');
  });

  test('it waits for AJAX requests to finish', async function(assert) {
    await this.render(hbs`{{x-test-3}}`);

    fireEvent(this.element.querySelector('div'), 'click');

    await settled();

    assert.equal(this.element.textContent, 'Remote Data!');
  });

  test('it waits for interleaved AJAX and run loops to finish', async function(assert) {
    var testContext = this;

    await this.render(hbs`{{x-test-4}}`);

    fireEvent(this.element.querySelector('div'), 'click');

    await settled();

    assert.equal(testContext.element.textContent, 'Local Data!Remote Data!Remote Data!');
  });

  test('it can wait only for AJAX', async function(assert) {
    var testContext = this;

    await this.render(hbs`{{x-test-4}}`);

    fireEvent(this.element.querySelector('div'), 'click');

    await settled({ waitForTimers: false });

    assert.equal(testContext.element.textContent, 'Local Data!Remote Data!');
  });

  // in the wait utility we specific listen for artificial jQuery events
  // to start/stop waiting, but when using ember-fetch those events are not
  // emitted and instead test waiters are used
  //
  // therefore, this test is only valid when using jQuery.ajax
  (hasjQuery() ? test : skip)('it can wait only for timers', async function(assert) {
    var testContext = this;

    await this.render(hbs`{{x-test-4}}`);

    fireEvent(this.element.querySelector('div'), 'click');

    await settled({ waitForAJAX: false });

    assert.equal(testContext.element.textContent, 'Local Data!');
  });

  test('it waits for Ember test waiters', async function(assert) {
    await this.render(hbs`{{x-test-5}}`);

    await settled({ waitForTimers: false });

    assert.equal(this.element.textContent, 'async value');
  });
});
