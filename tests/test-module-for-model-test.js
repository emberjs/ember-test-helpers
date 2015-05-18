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

var store1, store2;
moduleForModel('whazzit', 'model:whazzit without adapter', {
  beforeSetup: function() {
    setupRegistry();
  },

  setup: function() {
    Whazzit.FIXTURES = [];
  },

  teardown: function() {
    if (store1 && store2) {
      notEqual(store1, store2, 'store should be separate between tests');
    }
  }
});

test('store exists: 1', function() {
  store1 = this.store();

  ok(store1 instanceof DS.Store);
});

test('store exists: 2', function() {
  store2 = this.store();

  ok(store2 instanceof DS.Store);
});

test('model exists as subject', function() {
  var model = this.subject();

  ok(model);
  ok(model instanceof DS.Model);
  ok(model instanceof Whazzit);
});

test('FixtureAdapter is registered for model', function() {
  var model = this.subject(),
      store = this.store();

  ok(store.adapterFor(model.constructor) instanceof DS.FixtureAdapter);
  ok(!(store.adapterFor(model.constructor) instanceof WhazzitAdapter));
});

moduleForModel('whazzit', 'subject does not share the store', {
  beforeSetup: function() {
    setupRegistry();
  },

  teardown: function() {
    var model = this.subject();
    var store = this.store();

    equal(model.store, store, 'is created from the correct store instance');
  }
});

test('first subject test', function() { });
test('second subject test', function() { });

///////////////////////////////////////////////////////////////////////////////

moduleForModel('whazzit', 'model:whazzit with custom adapter', {
  needs: ['adapter:whazzit'],

  beforeSetup: function() {
    setupRegistry();
  },

  setup: function() {
    Whazzit.FIXTURES = [];
    whazzitAdapterFindAllCalled = false;
  }
});

test('WhazzitAdapter is registered for model', function() {
  var model = this.subject(),
      store = this.store();

  ok(store.adapterFor(model.constructor) instanceof WhazzitAdapter);
});

test('WhazzitAdapter is used for `find`', function() {
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

  beforeSetup: function() {
    setupRegistry();
  },

  setup: function() {
    Whazzit.FIXTURES = [];
  }
});

test('ApplicationAdapter is registered for model', function() {
  var model = this.subject(),
      store = this.store();

  ok(store.adapterFor(model.constructor) instanceof ApplicationAdapter);
  ok(!(store.adapterFor(model.constructor) instanceof WhazzitAdapter));
});

///////////////////////////////////////////////////////////////////////////////

moduleForModel('whazzit', 'model:whazzit when using integration:true', {

  integration: true,

  beforeSetup: function() {
    setupRegistry();
  }

});

test('the store still exists', function() {
  var store = this.store();

  ok(store instanceof DS.Store);
});
