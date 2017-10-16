import Ember from 'ember';
import $ from 'jquery'; // FYI - not present in all scenarios
import { later, run } from '@ember/runloop';
import Component from '@ember/component';
import { TestModuleForComponent } from 'ember-test-helpers';
import wait from 'ember-test-helpers/wait';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import Pretender from 'pretender';
import { fireEvent } from '../helpers/events';
import hasjQuery from '../helpers/has-jquery';
import require from 'require';

function ajax(url) {
  if (hasjQuery()) {
    return $.ajax(url, { cache: false });
  } else {
    let fetch = require('fetch').default;
    return fetch(url).then(response => response.text());
  }
}

module('wait helper tests', function(hooks) {
  hooks.beforeEach(function(assert) {
    this.module = new TestModuleForComponent('wait helper tests', {
      integration: true,

      setup() {
        this.register(
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

        this.register('template:components/x-test-1', hbs`{{internalValue}}`);

        this.register(
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

        this.register('template:components/x-test-2', hbs`{{internalValue}}`);

        this.register(
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

        this.register('template:components/x-test-3', hbs`{{internalValue}}`);

        this.register(
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

        this.register('template:components/x-test-4', hbs`{{internalValue}}`);

        this.register(
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

        this.register('template:components/x-test-5', hbs`{{internalValue}}`);

        this.server = new Pretender(function() {
          this.get(
            '/whazzits',
            function() {
              return [200, { 'Content-Type': 'text/plain' }, 'Remote Data!'];
            },
            25
          );
        });
      },
    });
    this.module.setContext(this);

    return this.module.setup(assert);
  });

  hooks.afterEach(function(assert) {
    this.server.shutdown();

    return wait().then(() => {
      return this.module.teardown(assert);
    });
  });

  test('it works when async exists in `init`', function(assert) {
    this.render(hbs`{{x-test-1}}`);

    return wait().then(() => {
      assert.equal(this._element.textContent, 'async value');
    });
  });

  test('it works when async exists in an event/action', function(assert) {
    this.render(hbs`{{x-test-2}}`);

    assert.equal(this._element.textContent, 'initial value');

    fireEvent(this._element.querySelector('div'), 'click');

    return wait().then(() => {
      assert.equal(this._element.textContent, 'async value');
    });
  });

  test('it waits for AJAX requests to finish', function(assert) {
    this.render(hbs`{{x-test-3}}`);

    fireEvent(this._element.querySelector('div'), 'click');

    return wait().then(() => {
      assert.equal(this._element.textContent, 'Remote Data!');
    });
  });

  test('it waits for interleaved AJAX and run loops to finish', function(assert) {
    var testContext = this;

    this.render(hbs`{{x-test-4}}`);

    fireEvent(this._element.querySelector('div'), 'click');

    return wait().then(function() {
      assert.equal(testContext._element.textContent, 'Local Data!Remote Data!Remote Data!');
    });
  });

  test('it can wait only for AJAX', function(assert) {
    var testContext = this;

    this.render(hbs`{{x-test-4}}`);

    fireEvent(this._element.querySelector('div'), 'click');

    return wait({ waitForTimers: false }).then(function() {
      assert.equal(testContext._element.textContent, 'Local Data!Remote Data!');
    });
  });

  if (hasjQuery()) {
    // in the wait utility we specific listen for artificial jQuery events
    // to start/stop waiting, but when using ember-fetch those events are not
    // emitted and instead test waiters are used
    //
    // therefore, this test is only valid when using jQuery.ajax
    test('it can wait only for timers', function(assert) {
      var testContext = this;

      this.render(hbs`{{x-test-4}}`);

      fireEvent(this._element.querySelector('div'), 'click');

      return wait({ waitForAJAX: false }).then(function() {
        assert.equal(testContext._element.textContent, 'Local Data!');
      });
    });
  }

  test('it waits for Ember test waiters', function(assert) {
    this.render(hbs`{{x-test-5}}`);

    return wait({ waitForTimers: false }).then(() => {
      assert.equal(this._element.textContent, 'async value');
    });
  });
});
