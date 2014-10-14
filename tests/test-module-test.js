import { TestModule } from 'ember-test-helpers';
import test from 'tests/test-support/qunit-test';
import qunitModuleFor from 'tests/test-support/qunit-module-for';
import { setResolverRegistry } from 'tests/test-support/resolver';

function moduleFor(fullName, description, callbacks) {
  var module = new TestModule(fullName, description, callbacks);
  qunitModuleFor(module);
}

function setupRegistry() {
  setResolverRegistry({
    'component:x-foo': Ember.Component.extend()
  });
}

var a = 0;
var b = 0;
var preSetupOk = false;
var preTeardownOk = false;

moduleFor('component:x-foo', 'TestModule callbacks', {
  preSetup: function() {
    setupRegistry();

    preSetupOk = (a === 0);
    b += 1;
  },

  setup: function() {
    a += 1;
  },

  preTeardown: function() {
    preTeardownOk = (a === 1);
    b -= 1;
  },

  teardown: function() {
    a -= 1;
  }
});

test("preSetup callback is called prior to any test setup", function() {
  ok(preSetupOk);
  equal(b, 1);
});

test("setup callback is called prior to test", function() {
  equal(a, 1);
});

test("teardown callback is called after test", function() {
  equal(a, 1);
});

test("preTeardown callback is called prior to any test teardown", function() {
  ok(preTeardownOk);
  equal(b, 1);
});
