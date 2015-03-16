import Ember from 'ember';
import { TestModuleForComponent } from 'ember-test-helpers';
import test from 'tests/test-support/qunit-test';
import qunitModuleFor from 'tests/test-support/qunit-module-for';
import { setResolverRegistry } from 'tests/test-support/resolver';

function moduleForComponent(name, description, callbacks) {
  var module = new TestModuleForComponent(name, description, callbacks);
  qunitModuleFor(module);
}

var PrettyColor = Ember.Component.extend({
  classNames: ['pretty-color'],
  attributeBindings: ['style'],
  style: function(){
    return 'color: ' + this.get('name') + ';';
  }.property('name')
});

var ColorController = Ember.ObjectController.extend({
  hexa: function() {
    switch( this.get('model') ) {
      case 'red':
        return '0xFF0000';
      case 'green':
        return '0x00FF00';
      case 'blue':
        return '0x0000FF';
    }
  }.property('model')
});

var BoringColor = Ember.Component.extend({
  willDestroyElement: function(){
    var stateIndicatesInDOM = (this._state === 'inDOM');
    var actuallyInDOM = Ember.$.contains(document, this.$()[0]);

    ok((actuallyInDOM === true) && (actuallyInDOM === stateIndicatesInDOM), 'component should still be in the DOM')
  }
});

var TaglessThing = Ember.Component.extend({
  tagName: ''
});

function setupRegistry() {
  setResolverRegistry({
    'component:x-foo': Ember.Component.extend(),
    'component:pretty-color': PrettyColor,
    'component:boring-color': BoringColor,
    'component:tagless-thing': TaglessThing,
    'template:components/pretty-color': Ember.Handlebars.compile('Pretty Color: <span class="color-name">{{name}}</span>'),
    'controller:color': ColorController
  });
}

///////////////////////////////////////////////////////////////////////////////

moduleForComponent('x-foo', {
  needs: ['controller:color'],

  beforeSetup: function() {
    setupRegistry();
  }
});

test('renders', function() {
  expect(2);
  var component = this.subject();
  equal(component._state, 'preRender');
  this.render();
  equal(component._state, 'inDOM');
});

test('append', function() {
  expect(2);
  var component = this.subject();
  equal(component._state, 'preRender');
  this.append();
  equal(component._state, 'inDOM');
  // TODO - is there still a way to check deprecationWarnings?
//  ok(Ember.A(Ember.deprecationWarnings).contains('this.append() is deprecated. Please use this.render() instead.'));
});

test('yields', function() {
  expect(2);
  var component = this.subject({
    layout: Ember.Handlebars.compile("yield me")
  });
  equal(component._state, 'preRender');
  this.render();
  equal(component._state, 'inDOM');
});

test('can lookup components in its layout', function() {
  expect(1);
  var component = this.subject({
    layout: Ember.Handlebars.compile("{{x-foo id='yodawg-i-heard-you-liked-x-foo-in-ur-x-foo'}}")
  });
  this.render();
  equal(component._state, 'inDOM');
});

test('can lookup array controllers in its layout', function() {
  expect(1);
  var component = this.subject({
    colors: ['red', 'green', 'blue'],
    layout: Ember.Handlebars.compile("{{#each colors itemController='color'}}{{hexa}}{{/each}}")
  });
  this.render();
  equal(component._state, 'inDOM');
});

test('can lookup object controllers in its layout', function() {
  expect(1);
  var component = this.subject({
    colors: ['red', 'green', 'blue'],
    layout: Ember.Handlebars.compile("{{#each colors itemController='object'}}{{this}}{{/each}}")
  });
  this.render();
  equal(component._state, 'inDOM');
});

test('can lookup basic controllers in its layout', function() {
  expect(1);
  var component = this.subject({
    colors: ['red', 'green', 'blue'],
    layout: Ember.Handlebars.compile("{{#each colors itemController='basic'}}{{this}}{{/each}}")
  });
  this.render();
  equal(component._state, 'inDOM');
});

test('can lookup Ember.Select in its layout', function() {
  expect(1);
  var component = this.subject({
    colors: ['red', 'green', 'blue'],
    layout: Ember.Handlebars.compile("{{view 'select'}}")
  });
  this.render();
  equal(component._state, 'inDOM');
});

test('can lookup default Ember.Views in its layout', function() {
  expect(1);
  var component = this.subject({
    colors: ['red', 'green', 'blue'],
    layout: Ember.Handlebars.compile("{{view 'default'}}")
  });
  this.render();
  equal(component._state, 'inDOM');
});

test('can lookup toplevel Ember.Views in its layout', function() {
  expect(1);
  var component = this.subject({
    colors: ['red', 'green', 'blue'],
    layout: Ember.Handlebars.compile("{{view 'toplevel'}}")
  });
  this.render();
  equal(component._state, 'inDOM');
});

test('clears out views from test to test', function() {
  expect(1);
  this.subject({
    layout: Ember.Handlebars.compile("{{x-foo id='yodawg-i-heard-you-liked-x-foo-in-ur-x-foo'}}")
  });
  this.render();
  ok(true, 'rendered without id already being used from another test');
});

///////////////////////////////////////////////////////////////////////////////

moduleForComponent('pretty-color', {
  beforeSetup: function() {
    setupRegistry();
  }
});

test("className", function(){
  // first call to this.$() renders the component.
  ok(this.$().is('.pretty-color'));
});

test("template", function(){
  var component = this.subject();

  equal($.trim(this.$().text()), 'Pretty Color:');

  Ember.run(function(){
    component.set('name', 'green');
  });

  equal($.trim(this.$().text()), 'Pretty Color: green');
});

test("$", function(){
  var component = this.subject({name: 'green'});
  equal($.trim(this.$('.color-name').text()), 'green');
  equal($.trim(this.$().text()), 'Pretty Color: green');
});

moduleForComponent('pretty-color', 'component:pretty-color -- this.render in setup', {
  beforeSetup: function() {
    setupRegistry();
  },

  setup: function() {
    this.subject({
      name: 'red'
    });

    this.render();
  }
});

test("className", function(){
  // calling `this.$` or `this.subject.$` would
  // force it to `render` initially, so we access the `ember-testing`
  // div contents directly
  equal($.trim($('#ember-testing').text()), 'Pretty Color: red');
});

moduleForComponent('boring-color', 'component:boring-color -- still in DOM in willDestroyElement', {
  beforeSetup: function() {
    setupRegistry();
  },

  setup: function() {
    this.render();
  }
});

test("className", function(){
  expect(1)
  // the assertion is in the willDestroyElement() hook of the component
});

moduleForComponent('tagless-thing', 'component:tagless-thing -- this.render', {
  beforeSetup: function() {
    setupRegistry();
  }
});

test("render returns undefined, does not call component.$()", function(){
  expect(2);

  var error = null;
  var result;

  try {
    result = this.render();
  } catch (e) {
    error = e;
  }

  if (error) {
    ok(false, 'render failed with error: ' + error.message);
  } else {
    ok(true, 'render did not error');
  }

  ok(result === undefined,
     'this.render() returns undefined');
});
