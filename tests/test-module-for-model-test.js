import { TestModuleForModel } from 'ember-test-helpers';
import test from 'tests/test-support/qunit-test';
import qunitModuleFor from 'tests/test-support/qunit-module-for';
import { setResolverRegistry } from 'tests/test-support/resolver';

function moduleForModel(name, description, callbacks) {
  var module = new TestModuleForModel(name, description, callbacks);
  qunitModuleFor(module);
}

var Whazzit = DS.Model.extend({ gear: DS.attr('string') });
var whazzitAdapterFindAllCalled = false;
var WhazzitAdapter = DS.FixtureAdapter.extend({
  findAll: function(store, type) {
    whazzitAdapterFindAllCalled = true;
    return this._super.apply(this, arguments);
  }
});

var ApplicationAdapter = DS.FixtureAdapter.extend();

function setupRegistry() {
  setResolverRegistry({
    'model:whazzit': Whazzit,
    'adapter:whazzit': WhazzitAdapter,
    'adapter:application': ApplicationAdapter
  });
}

///////////////////////////////////////////////////////////////////////////////

moduleForModel('whazzit', 'model:whazzit without adapter', {
  preSetup: function() {
    setupRegistry();
  },

  setup: function() {
    Whazzit.FIXTURES = [];
  }
});

test('store exists', function() {
  var store = this.store();
  ok(store instanceof DS.Store);
});

test('model exists as subject', function() {
  var model = this.subject();
  ok(model);
  ok(model instanceof DS.Model);
  ok(model instanceof Whazzit);
});

test('model is using the FixtureAdapter', function() {
  var model = this.subject(),
    store = this.store();

  ok(store.adapterFor(model.constructor) instanceof DS.FixtureAdapter);
  ok(!(store.adapterFor(model.constructor) instanceof WhazzitAdapter));
});

///////////////////////////////////////////////////////////////////////////////

moduleForModel('whazzit', 'model:whazzit with custom adapter', {
  needs: ['adapter:whazzit'],

  preSetup: function() {
    setupRegistry();
  },

  setup: function() {
    Whazzit.FIXTURES = [];
    whazzitAdapterFindAllCalled = false;
  }
});

test('model is using the WhazzitAdapter', function() {
  var model = this.subject(),
      store = this.store();

  ok(store.adapterFor(model.constructor) instanceof WhazzitAdapter);
});

test('uses the custom adapter', function() {
  expect(2);
  ok(!whazzitAdapterFindAllCalled, 'precond - custom adapter has not yet been called');

  var store = this.store();

  return Ember.run(function() {
    return store.find('whazzit').then(function() {
      ok(whazzitAdapterFindAllCalled, 'uses the custom adapter');
    });
  });
});

///////////////////////////////////////////////////////////////////////////////

moduleForModel('whazzit', 'model:whazzit with application adapter', {
  needs: ['adapter:application'],

  preSetup: function() {
    setupRegistry();
  },

  setup: function() {
    Whazzit.FIXTURES = [];
  }
});

test('model is using the ApplicationAdapter', function() {
  var model = this.subject(),
      store = this.store();

  ok(store.adapterFor(model.constructor) instanceof ApplicationAdapter);
  ok(!(store.adapterFor(model.constructor) instanceof WhazzitAdapter));
});
