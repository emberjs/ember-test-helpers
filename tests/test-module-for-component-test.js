import Ember from 'ember';
import { TestModuleForComponent } from 'ember-test-helpers';
import hasEmberVersion from 'ember-test-helpers/has-ember-version';
import test from 'tests/test-support/qunit-test';
import qunitModuleFor from 'tests/test-support/qunit-module-for';
import { setResolverRegistry } from 'tests/test-support/resolver';

var $ = Ember.$;

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
  this.subject({name: 'green'});

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
  integration: true,

  beforeSetup: function() {
    setupRegistry();
  }
});

if (hasEmberVersion(1,13)) {
  test('handles a closure actions', function() {
    expect(1);
    this.on('colorChange', function(arg) { equal(arg, 'foo'); });
    this.render(Ember.Handlebars.compile("{{changing-color change=(action 'colorChange')}}"));
  });
}

var testModule;
QUnit.module('moduleForComponent: can be invoked with only the component name', {
  beforeEach: function(assert) {
    var done = assert.async();
    setupRegistry();
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
QUnit.module('moduleForComponent: can be invoked with the component name and description', {
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

QUnit.module('moduleForComponent: handles errors thrown during setup', {
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

moduleForComponent('Component Integration Tests', {
  integration: true,
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

if (hasEmberVersion(1,11)) {
  test('it can render a link-to', function() {
    this.render("{{link-to 'Hi' 'index'}}");
    ok(true, 'it renders without fail');
  });
}

test('it complains if you try to use bare render', function() {
  var self = this;
  throws(function() {
    self.render();
  }, /in a component integration test you must pass a template to `render\(\)`/);
});

test('it complains if you try to use subject()', function() {
  var self = this;
  throws(function() {
    self.subject();
  }, /component integration tests do not support `subject\(\)`\./);
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

test('it supports DOM events', function() {
  setResolverRegistry({
    'component:my-component': Ember.Component.extend({
      value: 0,
      layout: Ember.Handlebars.compile("<span class='target'>Click to increment!</span><span class='value'>{{value}}</span>"),
      incrementOnClick: Ember.on('click', function() {
        this.incrementProperty('value');
      })
    })
  });
  this.render('{{my-component}}');
  this.$('.target').click();
  equal(this.$('.value').text(), '1');
});

test('it supports updating an input', function() {
  setResolverRegistry({
    'component:my-input': Ember.TextField.extend({
      value: null
    })
  });
  this.render('{{my-input value=value}}');
  this.$('input').val('1').change();
  equal(this.get('value'), '1');
});

test('it supports dom triggered focus events', function() {
  setResolverRegistry({
    'component:my-input': Ember.TextField.extend({
      _onInit: Ember.on('init', function() {
        this.set('value', 'init');
      }),
      focusIn: function() {
        this.set('value', 'focusin');
      },
      focusOut: function() {
        this.set('value', 'focusout');
      }
    })
  });
  this.render('{{my-input}}');
  equal(this.$('input').val(), 'init');

  this.$('input').trigger('focusin');
  equal(this.$('input').val(), 'focusin');

  this.$('input').trigger('focusout');
  equal(this.$('input').val(), 'focusout');
});

moduleForComponent('Component Integration Tests: render during setup', {
  integration: true,
  beforeSetup: function() {
    setResolverRegistry({
      'component:my-component': Ember.Component.extend({
        value: 0,
        layout: Ember.Handlebars.compile("<span class='target'>Click to increment!</span><span class='value'>{{value}}</span>"),
        incrementOnClick: Ember.on('click', function() {
          this.incrementProperty('value');
        })
      })
    });
  },
  setup: function() {
    this.render('{{my-component}}');
  }
});

test('it has working events', function() {
  this.$('.target').click();
  equal(this.$('.value').text(), '1');
});

moduleForComponent('Component Integration Tests: context', {
  integration: true,
  beforeSetup: function() {
    setResolverRegistry({
      'component:my-component': Ember.Component.extend({
        layout: Ember.Handlebars.compile('<span class="foo">{{foo}}</span><span class="bar">{{bar}}</span>')
      })
    });
  }
});

test('it can set and get properties', function() {
  var setResult = this.set('foo', 1);

  if (hasEmberVersion(2,0)) {
    equal(setResult, '1');
  } else {
    equal(setResult, undefined);
  }

  this.render('{{my-component foo=foo}}');
  equal(this.get('foo'), '1');
  equal(this.$('.foo').text(), '1');
});

test('it can setProperties and getProperties', function() {
  var hash = {
    foo: 1,
    bar: 2
  };
  var setResult = this.setProperties(hash);

  if (hasEmberVersion(2,0)) {
    deepEqual(setResult, hash);
  } else {
    equal(setResult, undefined);
  }

  this.render('{{my-component foo=foo bar=bar}}');
  var properties = this.getProperties('foo', 'bar');
  equal(properties.foo, '1');
  equal(properties.bar, '2');
  equal(this.$('.foo').text(), '1');
  equal(this.$('.bar').text(), '2');
});

var origDeprecate;
moduleForComponent('Component Integration Tests: implicit views are not deprecated', {
  integration: true,
  setup: function () {
    origDeprecate = Ember.deprecate;
    Ember.deprecate = function(msg, check) {
      if (!check) {
        throw new Error("unexpected deprecation: " + msg);
      }
    };
  },
  teardown: function () {
    Ember.deprecate = origDeprecate;
  }
});

test('the toplevel view is not deprecated', function () {
  expect(0);
  this.register('component:my-toplevel', this.container.lookupFactory('view:toplevel'));
  this.render("{{my-toplevel}}");
});


moduleForComponent('Component Integration Tests: register and inject', {
  integration: true
});

test('can register a component', function() {
  this.register('component:x-foo', Ember.Component.extend({
    classNames: ['i-am-x-foo']
  }));
  this.render("{{x-foo}}");
  equal(this.$('.i-am-x-foo').length, 1, "found i-am-x-foo");
});

test('can register a service', function() {
  this.register('component:x-foo', Ember.Component.extend({
    unicorn: Ember.inject.service(),
    layout: Ember.Handlebars.compile('<span class="x-foo">{{unicorn.sparkliness}}</span>')
  }));
  this.register('service:unicorn', Ember.Component.extend({
    sparkliness: 'extreme'
  }));
  this.render("{{x-foo}}");
  equal(this.$('.x-foo').text().trim(), "extreme");
});

test('can inject a service directly into test context', function() {
  this.register('component:x-foo', Ember.Component.extend({
    unicorn: Ember.inject.service(),
    layout: Ember.Handlebars.compile('<span class="x-foo">{{unicorn.sparkliness}}</span>')
  }));
  this.register('service:unicorn', Ember.Component.extend({
    sparkliness: 'extreme'
  }));
  this.inject.service('unicorn');
  this.render("{{x-foo}}");
  equal(this.$('.x-foo').text().trim(), "extreme");
  this.set('unicorn.sparkliness', 'amazing');
  equal(this.$('.x-foo').text().trim(), "amazing");
});

test('can inject a service directly into test context, with aliased name', function() {
  this.register('component:x-foo', Ember.Component.extend({
    unicorn: Ember.inject.service(),
    layout: Ember.Handlebars.compile('<span class="x-foo">{{unicorn.sparkliness}}</span>')
  }));
  this.register('service:unicorn', Ember.Component.extend({
    sparkliness: 'extreme'
  }));
  this.inject.service('unicorn', { as: 'hornedBeast' });
  this.render("{{x-foo}}");
  equal(this.$('.x-foo').text().trim(), "extreme");
  this.set('hornedBeast.sparkliness', 'amazing');
  equal(this.$('.x-foo').text().trim(), "amazing");
});

moduleForComponent('Component Integration Tests: willDestoryElement', {
  integration: true,
  beforeSetup: function() {
    setResolverRegistry({
      'component:my-component': Ember.Component.extend({
        willDestroyElement: function() {
          var stateIndicatesInDOM = (this._state === 'inDOM');
          var actuallyInDOM = Ember.$.contains(document, this.$()[0]);

          ok((actuallyInDOM === true) && (actuallyInDOM === stateIndicatesInDOM), 'component should still be in the DOM');
      }

      })
    });
  }
});

test('still in DOM in willDestroyElement', function() {
    expect(1);
    this.render("{{my-component}}");

});

if (!hasEmberVersion(2,0)) {
  moduleForComponent('my-component', 'Component Integration Tests', {
    integration: 'legacy',
    beforeSetup: function() {
      setResolverRegistry({
        'component:my-component': Ember.Component.extend(),
        'template:components/my-component': Ember.Handlebars.compile(
          '<span>{{name}}</span>'
        )
      });
    }
  });

  test('it can render components semantically equivalent to v0.4.3', function() {
    this.subject({
      name: 'Charles XII',
    });
    this.render();

    equal(this.$('span').text(), 'Charles XII');
  });
}
