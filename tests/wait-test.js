import Ember from 'ember';
import { TestModuleForComponent } from 'ember-test-helpers';
import test from 'tests/test-support/qunit-test';
import qunitModuleFor from 'tests/test-support/qunit-module-for';
import { setResolverRegistry } from 'tests/test-support/resolver';

import wait from 'ember-test-helpers/wait';

function moduleForComponent(name, description, callbacks) {
  var module = new TestModuleForComponent(name, description, callbacks);
  qunitModuleFor(module);
}


moduleForComponent('wait helper tests', {
  integration: true,
  setup: function() {
    this.register('component:x-test-1', Ember.Component.extend({
      internalValue: 'initial value',

      init: function() {
        this._super.apply(this, arguments);

        Ember.run.later(this, function() {
          this.set('internalValue', 'async value');
        }, 10);
      }
    }));

    this.register('template:components/x-test-1', Ember.Handlebars.compile("{{internalValue}}"));

    this.register('component:x-test-2', Ember.Component.extend({
      internalValue: 'initial value',

      click: function() {
        Ember.run.later(this, function() {
          this.set('internalValue', 'async value');
        }, 10);
      }
    }));

    this.register('template:components/x-test-2', Ember.Handlebars.compile(
      "{{internalValue}}"
    ));

    this.register('component:x-test-3', Ember.Component.extend({
      internalValue: '',

      click: function() {
        var component = this;

        jQuery.ajax('/whazzits', { cache: false })
          .then(function(data) {
            var value = component.get('internalValue');

            Ember.run(component, 'set', 'internalValue', value + data);
          });
      }
    }));

    this.register('template:components/x-test-3', Ember.Handlebars.compile("{{internalValue}}"));

    this.register('component:x-test-4', Ember.Component.extend({
      internalValue: '',

      click: function() {
        var component = this;

        Ember.run.later(function() {
          Ember.run(component, 'set', 'internalValue', 'Local Data!');
        }, 10);

        jQuery.ajax('/whazzits', { cache: false })
          .then(function(data) {
            var value = component.get('internalValue');

            Ember.run(component, 'set', 'internalValue', value + data);

            Ember.run.later(function() {

              jQuery.ajax('/whazzits', { cache: false })
                .then(function(data) {
                  if (component.isDestroyed) { return; }

                  var value = component.get('internalValue');

                  Ember.run(component, 'set', 'internalValue', value + data);
                });
            }, 15);
          });
      }
    }));

    this.register('template:components/x-test-4', Ember.Handlebars.compile("{{internalValue}}"));

    this.server = new Pretender(function() {
      this.get('/whazzits', function(request) {
        return [
          200,
          { "Content-Type": "text/plain" },
          'Remote Data!'
        ];
      }, 25);
    });
  },

  teardown: function() {
    this.server.shutdown();
  }
});

test('it works when async exists in `init`', function() {
  var testContext = this;

  this.render('{{x-test-1}}');

  return wait()
    .then(function() {
      equal(testContext.$().text(), 'async value');
    });
});

test('it works when async exists in an event/action', function() {
  var testContext = this;

  this.render('{{x-test-2}}');

  equal(this.$().text(), 'initial value');

  this.$('div').click();

  return wait()
    .then(function() {
      equal(testContext.$().text(), 'async value');
    });
});

test('it waits for AJAX requests to finish', function() {
  var testContext = this;

  this.render('{{x-test-3}}');

  this.$('div').click();

  return wait()
    .then(function() {
      equal(testContext.$().text(), 'Remote Data!' );
    });
});

test('it waits for interleaved AJAX and run loops to finish', function() {
  var testContext = this;

  this.render('{{x-test-4}}');

  this.$('div').click();

  return wait()
    .then(function() {
      equal(testContext.$().text(), 'Local Data!Remote Data!Remote Data!' );
    });
});

test('it can wait only for AJAX', function() {
  var testContext = this;

  this.render('{{x-test-4}}');

  this.$('div').click();

  return wait({ waitForTimers: false })
    .then(function() {
      equal(testContext.$().text(), 'Local Data!Remote Data!' );
    });
});

test('it can wait only for timers', function() {
  var testContext = this;

  this.render('{{x-test-4}}');

  this.$('div').click();

  return wait({ waitForAJAX: false })
    .then(function() {
      equal(testContext.$().text(), 'Local Data!' );
    });
});
