import { module, test } from 'qunit';
import Service from '@ember/service';
import {
  getContext,
  setupContext,
  teardownContext,
  isSettled,
  getSettledState,
} from '@ember/test-helpers';
import { setResolverRegistry } from '../helpers/resolver';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import Ember from 'ember';
import hasjQuery from '../helpers/has-jquery';
import ajax from '../helpers/ajax';
import Pretender from 'pretender';

module('teardownContext', function(hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  let context;
  hooks.beforeEach(function() {
    this.pretender = new Pretender();
    setResolverRegistry({
      'service:foo': Service.extend({ isFoo: true }),
    });
    context = {};
    return setupContext(context);
  });

  hooks.afterEach(function() {
    this.pretender.shutdown();
  });

  test('it destroys any instances created', async function(assert) {
    let instance = context.owner.lookup('service:foo');
    assert.notOk(instance.isDestroyed, 'precond - not destroyed');
    assert.notOk(instance.isDestroying, 'precond - not destroying');

    await teardownContext(context);

    assert.ok(instance.isDestroyed, 'destroyed');
    assert.ok(instance.isDestroying, 'destroying');
  });

  test('it sets Ember.testing to false', async function(assert) {
    assert.ok(Ember.testing, 'precond - Ember.testing is truthy');

    await teardownContext(context);

    assert.notOk(Ember.testing, 'Ember.testing is falsey after teardown');
  });

  test('it unsets the context', async function(assert) {
    assert.strictEqual(getContext(), context, 'precond');

    await teardownContext(context);

    assert.strictEqual(getContext(), undefined, 'context is unset');
  });

  if (hasjQuery()) {
    test('out of balance xhr semaphores are cleaned up on teardown', async function(assert) {
      this.pretender.unhandledRequest = function(/* verb, path, request */) {
        throw new Error(`Synchronous error from Pretender.prototype.unhandledRequest`);
      };

      ajax('/some/totally/invalid/url');

      await teardownContext(context);

      assert.ok(
        isSettled(),
        `out of balance xhr semaphores are cleaned up on teardown: ${getSettledState()}`
      );
    });
  }
});
