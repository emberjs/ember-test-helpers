import { module, test } from 'qunit';
import { run } from '@ember/runloop';
import {
  TestDebugInfo,
  backburnerDebugInfoAvailable,
} from '@ember/test-helpers/-internal/debug-info';
import MockStableError, { overrideError, resetError } from './utils/mock-stable-error';
import { MockConsole, getRandomBoolean, getMockDebugInfo } from './utils/test-isolation-helpers';
import { registerDebugInfoHelper } from '@ember/test-helpers';
import { debugInfoHelpers } from '@ember/test-helpers/-internal/debug-info-helpers';

module('TestDebugInfo', function(hooks) {
  hooks.beforeEach(function() {
    run.backburner.DEBUG = false;
  });

  hooks.afterEach(function() {
    run.backburner.DEBUG = true;
  });

  test('summary returns minimal information when debugInfo is not present', function(assert) {
    assert.expect(1);

    let hasPendingTimers = getRandomBoolean();
    let hasPendingWaiters = getRandomBoolean();
    let hasRunLoop = getRandomBoolean();
    let hasPendingRequests = Boolean(Math.floor(Math.random(10)) > 0);
    let testDebugInfo = new TestDebugInfo(
      hasPendingTimers,
      hasRunLoop,
      hasPendingWaiters,
      hasPendingRequests
    );

    assert.deepEqual(testDebugInfo.summary, {
      hasPendingRequests,
      hasPendingTimers,
      hasPendingWaiters,
      hasRunLoop,
    });
  });

  if (backburnerDebugInfoAvailable()) {
    module('when using backburner', function(hooks) {
      let cancelIds;

      hooks.beforeEach(function() {
        run.backburner.DEBUG = true;

        cancelIds = [];
        overrideError(MockStableError);
      });

      hooks.afterEach(function() {
        cancelIds.forEach(cancelId => run.cancel(cancelId));

        run.backburner.DEBUG = false;

        resetError();
      });

      test('summary returns full information when debugInfo is present', function(assert) {
        assert.expect(1);

        cancelIds.push(run.later(() => {}, 5000));
        cancelIds.push(run.later(() => {}, 10000));

        let testDebugInfo = new TestDebugInfo(
          false,
          false,
          false,
          false,
          run.backburner.getDebugInfo()
        );

        assert.deepEqual(testDebugInfo.summary, {
          autorunStackTrace: null,
          hasPendingRequests: false,
          hasPendingTimers: false,
          hasPendingWaiters: false,
          hasRunLoop: false,
          pendingScheduledQueueItemCount: 0,
          pendingScheduledQueueItemStackTraces: [],
          pendingTimersCount: 2,
          pendingTimersStackTraces: ['STACK', 'STACK'],
        });
      });
    });
  }

  test('toConsole correctly prints minimal information', function(assert) {
    assert.expect(1);

    let mockConsole = new MockConsole();

    let testDebugInfo = new TestDebugInfo(false, false, false, false);

    testDebugInfo.toConsole(mockConsole);

    assert.deepEqual(mockConsole.toString(), '');
  });

  test('toConsole correctly prints Scheduled autorun information', function(assert) {
    assert.expect(1);

    let mockConsole = new MockConsole();

    let testDebugInfo = new TestDebugInfo(
      false,
      true,
      false,
      false,
      getMockDebugInfo(new MockStableError('STACK'), 0, null)
    );

    testDebugInfo.toConsole(mockConsole);

    assert.deepEqual(
      mockConsole.toString(),
      `Scheduled autorun
STACK`
    );
  });

  test('toConsole correctly prints AJAX information', function(assert) {
    assert.expect(1);

    let mockConsole = new MockConsole();

    let testDebugInfo = new TestDebugInfo(false, false, false, true);

    testDebugInfo.toConsole(mockConsole);

    assert.deepEqual(mockConsole.toString(), `Pending AJAX requests`);
  });

  test('toConsole correctly prints pending test waiter information', function(assert) {
    assert.expect(1);

    let mockConsole = new MockConsole();

    let testDebugInfo = new TestDebugInfo(false, false, true, false);

    testDebugInfo.toConsole(mockConsole);

    assert.deepEqual(mockConsole.toString(), `Pending test waiters`);
  });

  test('toConsole correctly prints scheduled async information', function(assert) {
    assert.expect(1);

    let mockConsole = new MockConsole();

    let testDebugInfo = new TestDebugInfo(
      true,
      true,
      false,
      false,
      getMockDebugInfo(false, 2, [{ name: 'one', count: 1 }, { name: 'two', count: 1 }])
    );

    testDebugInfo.toConsole(mockConsole);

    assert.deepEqual(
      mockConsole.toString(),
      `Scheduled async
STACK
STACK
STACK
STACK`
    );
  });

  test('toConsole correctly prints scheduled async information with only scheduled queue items', function(assert) {
    assert.expect(1);

    let mockConsole = new MockConsole();

    let testDebugInfo = new TestDebugInfo(
      false,
      false,
      false,
      false,
      getMockDebugInfo(false, 0, [{ name: 'one', count: 1 }, { name: 'two', count: 1 }])
    );

    testDebugInfo.toConsole(mockConsole);

    assert.deepEqual(
      mockConsole.toString(),
      `Scheduled async
STACK
STACK`
    );
  });

  test('registerDebugInfoHelper registers a custom helper', function(assert) {
    assert.expect(1);

    let mockConsole = new MockConsole();

    let debugInfoHelper = {
      toConsole() {
        mockConsole.log('Date override');
      },
    };

    registerDebugInfoHelper(debugInfoHelper);

    let testDebugInfo = new TestDebugInfo(false, false, false, false);

    testDebugInfo.toConsole(mockConsole);

    assert.equal(mockConsole.toString(), 'Date override');

    debugInfoHelpers.clear();
  });
});
