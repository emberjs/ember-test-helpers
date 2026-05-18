import Application from '@ember/application';
import { module, test } from 'qunit';
import { application, resolver } from '../helpers/resolver';
import {
  getApplication,
  setApplication,
  setResolver,
  getResolver,
} from '@ember/test-helpers';

module('application', function (hooks) {
  hooks.beforeEach(function () {
    setApplication(null);
    setResolver(null);
  });

  hooks.afterEach(function () {
    setApplication(application);
    setResolver(resolver);
  });

  test('RFC#1132: calling set application does not set resolver if the application has modules = {}', function (assert) {
    class App extends Application {
      modules = {};
    }

    setApplication(App);

    let actualResolver = getResolver();
    assert.notOk(actualResolver, 'there is no resolver');
    assert.deepEqual(getApplication().constructor, application.constructor);
  });

  test('calling setApplication sets resolver when resolver is unset', function (assert) {
    setApplication(application);

    let actualResolver = getResolver();
    assert.ok(
      actualResolver instanceof application.Resolver,
      'a resolver instance was created from the provided application'
    );
    assert.equal(
      actualResolver.namespace,
      application,
      'resolver has proper namespace specified'
    );
    assert.notOk(
      actualResolver.isResolverFromTestHelpers,
      'should not have used resolver created in tests/helpers/resolver.js'
    );
    assert.deepEqual(getApplication().constructor, application.constructor);
  });

  test('calling setApplication when a resolver is set does not clobber existing resolver', function (assert) {
    setResolver(resolver);
    setApplication(application);

    let actualResolver = getResolver();
    assert.ok(
      actualResolver.isResolverFromTestHelpers,
      'should have used resolver created in tests/helpers/resolver.js'
    );
  });
});
