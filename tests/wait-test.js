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
