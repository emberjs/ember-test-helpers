import { TestModule } from 'ember-test-helpers';
import test from 'tests/test-support/qunit-test';
import { setResolverRegistry } from 'tests/test-support/resolver';

var registry = {
  'component:x-foo': Ember.Component.extend()
};

function moduleFor(fullName, description, callbacks) {
  var module = new TestModule(fullName, description, callbacks);

  QUnit.module(module.name, {
    setup: function() {
      setResolverRegistry(registry);
      module.setup();
    },
    teardown: function() {
      module.teardown();
    }
  });
}

var a = 0;

moduleFor('component:x-foo', 'moduleFor callbacks', {
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
