import Ember from 'ember';
import { TestModuleForIntegration } from 'ember-test-helpers';
import test from 'tests/test-support/qunit-test';
import qunitModuleFor from 'tests/test-support/qunit-module-for';
import { setResolverRegistry } from 'tests/test-support/resolver';

function moduleForIntegration(name, description, callbacks) {
  var module = new TestModuleForIntegration(name, description, callbacks);
  qunitModuleFor(module);
}

moduleForIntegration('Better Integration Tests', {
  beforeSetup: function() {
    setResolverRegistry({
      'template:components/my-component': Ember.Handlebars.compile(
        '<span>{{name}}</span>'
      )
    });
  }
});

test('it can render a template', function() {
  this.render("<span>Hello</span>");
  equal(this.$('span').text(), 'Hello');
});

test('it can access the full container', function() {
  this.set('myColor', 'red');
  this.render('{{my-component name=myColor}}');
  equal(this.$('span').text(), 'red');
  this.set('myColor', 'blue');
  equal(this.$('span').text(), 'blue');
});

test('it can handle actions', function() {
  var handlerArg;
  this.render('<button {{action "didFoo" 42}} />');
  this.on('didFoo', function(thing) {
    handlerArg = thing;
  });
  this.$('button').click();
  equal(handlerArg, 42);
});

test('it accepts precompiled templates', function() {
  this.render(Ember.Handlebars.compile("<span>Hello</span>"));
  equal(this.$('span').text(), 'Hello');
});
