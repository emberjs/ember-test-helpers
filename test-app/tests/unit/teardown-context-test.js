import { module, test } from 'qunit';
import Service from '@ember/service';
import {
  getContext,
  setupContext,
  teardownContext,
  settled,
  isSettled,
} from '@ember/test-helpers';
import { setResolverRegistry } from '../helpers/resolver';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import { isTesting } from '@ember/debug';

import setupManualTestWaiter from '../helpers/manual-test-waiter';

module('teardownContext', function (hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  setupManualTestWaiter(hooks);

  let context;
  hooks.beforeEach(function () {
    setResolverRegistry({
      'service:foo': Service.extend({ isFoo: true }),
    });
    context = {};
    return setupContext(context);
  });

  test('it destroys any instances created', async function (assert) {
    let instance = context.owner.lookup('service:foo');
    assert.notOk(instance.isDestroyed, 'precond - not destroyed');
    assert.notOk(instance.isDestroying, 'precond - not destroying');

    await teardownContext(context);

    assert.ok(instance.isDestroyed, 'destroyed');
    assert.ok(instance.isDestroying, 'destroying');
  });

  test('it sets isTesting() to false', async function (assert) {
    assert.ok(isTesting(), 'precond - isTesting() is truthy');

    await teardownContext(context);

    assert.notOk(isTesting(), 'isTesting() is falsey after teardown');
  });

  test('it unsets the context', async function (assert) {
    assert.strictEqual(getContext(), context, 'precond');

    await teardownContext(context);

    assert.strictEqual(getContext(), undefined, 'context is unset');
  });

  test('the owner is destroyed', async function (assert) {
    await teardownContext(context);

    assert.ok(context.owner.isDestroyed);
  });

  test('the context is not destroyed', async function (assert) {
    await teardownContext(context);

    assert.ok(context.owner.isDestroyed);
    assert.notOk(context.isDestroyed);
  });

  test('the application instance is destroyed and unwatched', async function (assert) {
    let instance = context.owner.lookup('-application-instance:main');
    await teardownContext(context);

    assert.equal(instance.isDestroyed, true);
    assert.equal(
      instance.application._applicationInstances.has(instance),
      false
    );
  });

  test('can opt out of waiting for settledness', async function (assert) {
    this.shouldWait = true;

    assert.equal(isSettled(), false, 'should not be settled');

    await teardownContext(context, { waitForSettled: false });

    assert.equal(isSettled(), false, 'should not be settled');

    this.shouldWait = false;
    await settled();

    assert.equal(isSettled(), true, 'should be settled');
  });
});
