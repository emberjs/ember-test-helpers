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
var beforeSetupOk = false;
var afterTeardownOk = false;

var callbackOrder, setupContext, teardownContext, beforeSetupContext, afterTeardownContext;

moduleFor('component:x-foo', 'TestModule callbacks', {
  beforeSetup: function() {
    beforeSetupContext = this;
    callbackOrder = [ 'beforeSetup' ];

    setupRegistry();
  },

  setup: function() {
    setupContext = this;
    callbackOrder.push('setup');

    ok(setupContext !== beforeSetupContext);
  },

  teardown: function() {
    teardownContext = this;
    callbackOrder.push('teardown');

    deepEqual(callbackOrder, [ 'beforeSetup', 'setup', 'teardown']);
    equal(setupContext, teardownContext);
  },

  afterTeardown: function() {
    afterTeardownContext = this;
    callbackOrder.push('afterTeardown');

    deepEqual(callbackOrder, [ 'beforeSetup', 'setup', 'teardown', 'afterTeardown']);
    equal(afterTeardownContext, beforeSetupContext);
    ok(afterTeardownContext !== teardownContext);
  }
});

test("setup callbacks called in the correct order", function() {
  deepEqual(callbackOrder, [ 'beforeSetup', 'setup' ]);
});

moduleFor('component:x-foo', 'component:x-foo -- setup context', {
  beforeSetup: function() {
    setupRegistry();
  },

  setup: function() {
    this.subject({
      name: 'Max'
    });

    this.container.register('service:blah', Ember.Object.extend({
      purpose: 'blabering'
    }));
  }
});

test("subject can be initialized in setup", function() {
  equal(this.subject().name, 'Max');
});

test("can lookup factory registered in setup", function() {
  var service = this.container.lookup('service:blah');

  equal(service.get('purpose'), 'blabering');
});

moduleFor('component:x-foo', 'component:x-foo -- callback context', {
  beforeSetup: function() {
    setupRegistry();
  },

  getSubjectName: function() {
    return this.subjectName;
  }
});

test("callbacks are called in the context of the module", function() {
  equal(this.getSubjectName(), 'component:x-foo');
});

moduleFor('component:x-foo', 'component:x-foo -- created subjects are cleaned up', {
  beforeSetup: function() {
    setupRegistry();
  },

  afterTeardown: function() {
    var subject = this.cache.subject;

    ok(subject.isDestroyed);
  }
});

test("subject's created in a test are destroyed", function() {
  this.subject();
});

moduleFor('component:x-foo', 'component:x-foo -- uncreated subjects do not error', {
  beforeSetup: function() {
    setupRegistry();
  }
});

test("subject's created in a test are destroyed", function() {
  expect(0);
});
