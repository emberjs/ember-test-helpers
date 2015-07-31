import { TestModuleForModel } from 'ember-test-helpers';
import test from 'tests/test-support/qunit-test';
import qunitModuleFor from 'tests/test-support/qunit-module-for';
import { setResolverRegistry } from 'tests/test-support/resolver';

function moduleForModel(name, description, callbacks) {
  var module = new TestModuleForModel(name, description, callbacks);
  qunitModuleFor(module);
}

var server;

var adapter = DS.JSONAPIAdapter || DS.FixtureAdapter;

var Whazzit = DS.Model.extend({ gear: DS.attr('string') });
var whazzitAdapterFindAllCalled = false;
var WhazzitAdapter = adapter.extend({
  findAll: function(store, type) {
    whazzitAdapterFindAllCalled = true;
    return this._super.apply(this, arguments);
  }
});

var ApplicationAdapter = adapter.extend();

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

test('JSONAPIAdapter (ED >= 2) or FixtureAdapter (ED < 2) is registered for model', function() {
  var model = this.subject(),
      store = this.store();

  ok(store.adapterFor(model.constructor.modelName) instanceof adapter);
  ok(!(store.adapterFor(model.constructor.modelName) instanceof WhazzitAdapter));
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

    if (DS.JSONAPIAdapter && adapter === DS.JSONAPIAdapter) {
      server = new Pretender(function() {
        this.get('/whazzits', function(request) {
          return [200, {"Content-Type": "application/json"}, JSON.stringify({ data: Whazzit.FIXTURES })];
        });
      });
    }

    whazzitAdapterFindAllCalled = false;
  },

  teardown: function() {
    if (DS.JSONAPIAdapter && adapter === DS.JSONAPIAdapter) {
      server.shutdown();
    }
  }
});

test('WhazzitAdapter is registered for model', function() {
  var model = this.subject(),
      store = this.store();

  ok(store.adapterFor(model.constructor.modelName) instanceof WhazzitAdapter);
});

test('WhazzitAdapter is used for `findAll`', function() {
  expect(2);
  ok(!whazzitAdapterFindAllCalled, 'precond - custom adapter has not yet been called');

  var store = this.store();

  return Ember.run(function() {
    return store.findAll('whazzit', { reload: true }).then(function() {
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

  ok(store.adapterFor(model.constructor.modelName) instanceof ApplicationAdapter);
  ok(!(store.adapterFor(model.constructor.modelName) instanceof WhazzitAdapter));
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
