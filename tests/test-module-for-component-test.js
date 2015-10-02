import Ember from 'ember';
import { TestModuleForComponent } from 'ember-test-helpers';
import hasEmberVersion from 'ember-test-helpers/has-ember-version';
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
    return new Ember.Handlebars.SafeString('color: ' + this.get('name') + ';');
  }.property('name'),

  click: function() {
    ok(true, 'pretty-color was clicked');
  }
});

var ColorController = Ember.Controller.extend({
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

    ok((actuallyInDOM === true) && (actuallyInDOM === stateIndicatesInDOM), 'component should still be in the DOM');
  }
});

var ChangingColor = Ember.Component.extend({
  didInsertElement: function() {
    this.attrs.change('foo');
  }
});

function setupRegistry() {
  setResolverRegistry({
    'component:x-foo': Ember.Component.extend(),
    'component:pretty-color': PrettyColor,
    'component:boring-color': BoringColor,
    'component:changing-color': ChangingColor,
    'template:components/pretty-color': Ember.Handlebars.compile('Pretty Color: <span class="color-name">{{name}}</span>'),
    'controller:color': ColorController
  });
}

///////////////////////////////////////////////////////////////////////////////

var originalDeprecate;
moduleForComponent('x-foo', {
  needs: ['controller:color'],

  setup: function() {
    originalDeprecate = Ember.deprecate;
  },

  teardown: function() {
    Ember.deprecate = originalDeprecate;
  },

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
  expect(4);

  var deprecations = [];
  var $el;
  var component;

  // capture all deprecations so they can be checked later
  Ember.deprecate = function(message) {
    deprecations.push(message);
  };
  component = this.subject();
  equal(component._state, 'preRender');
  $el = this.append();
  equal(component._state, 'inDOM');
  ok($el && $el.length, 'append returns $el');
  ok(Ember.A(deprecations).contains('this.append() is deprecated. Please use this.render() or this.$() instead.'));
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

if (hasEmberVersion(1,11)) {
  test('can use the component keyword in its layout', function() {
    expect(1);
    var component = this.subject({
      colors: ['red', 'green', 'blue'],
      layout: Ember.Handlebars.compile("{{component 'x-foo'}}")
    });
    this.render();
    equal(component._state, 'inDOM');
  });
}

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
  unit: true,
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
  unit: true,
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
  unit: true,
  beforeSetup: function() {
    setupRegistry();
  },

  setup: function() {
    this.render();
  }
});

test("className", function(){
  expect(1);
  // the assertion is in the willDestroyElement() hook of the component
});

moduleForComponent('pretty-color', 'component:pretty-color - event dispatching works in unit tests', {
  unit: true,
  beforeSetup: function() {
    setupRegistry();
  }
});

test('can handle click', function() {
  expect(1); // assert in pretty-color `click` handler above

  var component = this.subject();

  this.render();

  Ember.run(function() {
    component.$().click();
  });
});

moduleForComponent('changing-color', 'component:changing-color -- handles closure actions', {
  integration: true
});

if (hasEmberVersion(1,13)) {
  test('handles a closure actions', function() {
    expect(1);
    this.on('colorChange', function(arg) { equal(arg, 'foo'); });
    this.render(Ember.Handlebars.compile("{{changing-color change=(action 'colorChange')}}"));
  });
}

var testModule;
module('moduleForComponent: can be invoked with only the component name', {
  beforeEach: function(assert) {
    var done = assert.async();
    testModule = new TestModuleForComponent('pretty-color', { unit: true });
    testModule.setup()['finally'](done);
  },

  afterEach: function(assert) {
    var done = assert.async();
    testModule.teardown()['finally'](done);
  }
});

test('it allows missing callbacks', function() {
  ok(true, 'no errors are thrown');
});

var testModule;
module('moduleForComponent: can be invoked with the component name and description', {
  beforeEach: function(assert) {
    var done = assert.async();
    testModule = new TestModuleForComponent('pretty-color', 'PrettyColor', { unit: true });
    testModule.setup()['finally'](done);
  },

  afterEach: function(assert) {
    var done = assert.async();
    testModule.teardown()['finally'](done);
  }
});

test('it allows missing callbacks', function() {
  ok(true, 'no errors are thrown');
});

module('moduleForComponent: handles errors thrown during setup', {
  beforeEach: function(assert) {
    var done = assert.async();
    testModule = new TestModuleForComponent('x-bad', {
      needs: ['mis:sing'],

      beforeEach: function(assert) {
        // won't be called because of setup error
        var done = assert.async();
        assert.ok(true);
        done();
      }
    });

    testModule.setup()
      .catch(function(error) {
        ok(error.message.indexOf('mis:sing') > -1, 'correct error was thrown from module setup');
      })
      .finally(done);
  }
});

test('it happens', function() {
  ok(true, 'errors are properly thrown/handled');
});
