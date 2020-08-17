import { module, test } from 'qunit';
import {
  setupContext,
  setupRenderingContext,
  teardownContext,
  teardownRenderingContext,
  settled,
  isSettled,
} from '@ember/test-helpers';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import setupManualTestWaiter from '../helpers/manual-test-waiter';

module('teardownRenderingContext', function (hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }
  setupManualTestWaiter(hooks);

  hooks.beforeEach(async function () {
    await setupContext(this);
    await setupRenderingContext(this);
  });

  hooks.afterEach(function () {
    return teardownContext(this);
  });

  test('can opt out of waiting for settledness', async function (assert) {
    this.shouldWait = true;

    assert.equal(isSettled(), false, 'should not be settled');

    await teardownRenderingContext(this, { waitForSettled: false });
    await teardownContext(this, { waitForSettled: false });

    assert.equal(isSettled(), false, 'should not be settled');

    this.shouldWait = false;
    await settled();

    assert.equal(isSettled(), true, 'should be settled');
  });
});
