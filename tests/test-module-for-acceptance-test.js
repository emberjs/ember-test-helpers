import Ember from 'ember';
import { TestModuleForAcceptance } from 'ember-test-helpers';
import test from 'tests/test-support/qunit-test';
import qunitModuleFor from 'tests/test-support/qunit-module-for';
import Resolver, { setResolverRegistry } from 'tests/test-support/resolver';
import { getContext } from 'ember-test-helpers/test-context';

function moduleForAcceptance(description, callbacks) {
  qunitModuleFor(new TestModuleForAcceptance(description, callbacks));
}

let Application = Ember.Application.extend({
  rootElement: '#ember-testing',
  Resolver
});

moduleForAcceptance('TestModuleForAcceptance | Lifecycle', {
  Application,

  beforeSetup(assert) {
    assert.expect(6);
    assert.strictEqual(getContext(), undefined);

    setResolverRegistry({
      'router:main': Ember.Router.extend({ location: 'none' })
    });
  },

  setup(assert) {
    assert.ok(getContext().application instanceof Ember.Application);
  },

  teardown(assert) {
    assert.ok(getContext().application instanceof Ember.Application);
  },

  afterTeardown(assert) {
    assert.strictEqual(getContext(), undefined);
    assert.strictEqual(Ember.$('#ember-testing').children().length, 0);
  }
});

test('Lifecycle is correct', function() {
  ok(true);
});

moduleForAcceptance('TestModuleForAcceptance | Basic acceptance tests', {
  Application,

  beforeSetup() {
    setResolverRegistry({
      'router:main': Ember.Router.extend({ location: 'none' }),
      'template:index': Ember.Handlebars.compile('This is the index page.')
    });
  }
});

test('Basic acceptance test using instance test helpers', function() {
  this.application.testHelpers.visit('/');

  this.application.testHelpers.andThen(function() {
    equal(Ember.$('#ember-testing').text(), 'This is the index page.');
  });
});

test('Basic acceptance test using global test helpers', function() {
  window.visit('/');

  window.andThen(function() {
    equal(Ember.$('#ember-testing').text(), 'This is the index page.');
  });
});
