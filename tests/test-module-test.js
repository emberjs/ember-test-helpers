import { TestModule } from 'ember-test-helpers';
import test from 'tests/test-support/qunit-test';
import qunitModuleFor from 'tests/test-support/qunit-module-for';
import { setResolverRegistry } from 'tests/test-support/resolver';

function moduleFor(fullName, description, callbacks) {
  var module = new TestModule(fullName, description, callbacks);
  qunitModuleFor(module);
}

var registry = {
  'component:x-foo': Ember.Component.extend()
};

var a = 0;

moduleFor('component:x-foo', 'moduleFor callbacks', {
  preSetup: function() {
    setResolverRegistry(registry);
  },

  setup: function() {
    a += 1;
  },

  teardown: function() {
    a -= 1;
  }
});

test("setup callback is called prior to test", function() {
  equal(a, 1);
});

test("teardown callback is called after test", function() {
  equal(a, 1);
});
