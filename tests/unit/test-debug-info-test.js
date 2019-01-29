import { module, test } from 'qunit';
import { run } from '@ember/runloop';
import DebugInfo, { getDebugInfo } from '@ember/test-helpers/-internal/debug-info';
import MockStableError, { overrideError, resetError } from './utils/mock-stable-error';
import { MockConsole, getRandomBoolean, getMockDebugInfo } from './utils/test-isolation-helpers';

module('TestDebugInfo', function() {
  test('summary returns minimal information when debugInfo is not present', function(assert) {
    assert.expect(1);

    let hasPendingTimers = getRandomBoolean();
    let hasPendingWaiters = getRandomBoolean();
    let hasRunLoop = getRandomBoolean();
    let hasPendingRequests = Boolean(Math.floor(Math.random(10)) > 0);
    let testDebugInfo = new DebugInfo(
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

  test('summary returns full information when debugInfo is present', function(assert) {
    assert.expect(1);

    run.backburner.DEBUG = false;

    let testDebugInfo = new DebugInfo(
      false,
      false,
      false,
      false,
      getMockDebugInfo(false, 2, [{ name: 'one', count: 1 }, { name: 'two', count: 1 }])
    );

    assert.deepEqual(testDebugInfo.summary, {
      autorunStackTrace: undefined,
      hasPendingRequests: false,
      hasPendingTimers: false,
      hasPendingWaiters: false,
      hasRunLoop: false,
      pendingScheduledQueueItemCount: 2,
      pendingScheduledQueueItemStackTraces: ['STACK', 'STACK'],
      pendingTimersCount: 2,
      pendingTimersStackTraces: ['STACK', 'STACK'],
    });
  });

  if (getDebugInfo()) {
    module('when using backburner', function(hooks) {
      let cancelIds;

      hooks.beforeEach(function() {
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

        run.backburner.DEBUG = true;

        cancelIds.push(run.later(() => {}, 5000));
        cancelIds.push(run.later(() => {}, 10000));

        let testDebugInfo = new DebugInfo(
          false,
          false,
          false,
          false,
          run.backburner.getDebugInfo()
        );

        assert.deepEqual(testDebugInfo.summary, {
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

    let testDebugInfo = new DebugInfo(false, false, false, false);

    testDebugInfo.toConsole(mockConsole);

    assert.deepEqual(mockConsole.toString(), '');
  });

  test('toConsole correctly prints Scheduled autorun information', function(assert) {
    assert.expect(1);

    let mockConsole = new MockConsole();

    let testDebugInfo = new DebugInfo(
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

    let testDebugInfo = new DebugInfo(false, false, false, true);

    testDebugInfo.toConsole(mockConsole);

    assert.deepEqual(mockConsole.toString(), `Pending AJAX requests`);
  });

  test('toConsole correctly prints pending test waiter information', function(assert) {
    assert.expect(1);

    let mockConsole = new MockConsole();

    let testDebugInfo = new DebugInfo(false, false, true, false);

    testDebugInfo.toConsole(mockConsole);

    assert.deepEqual(mockConsole.toString(), `Pending test waiters`);
  });

  test('toConsole correctly prints scheduled async information', function(assert) {
    assert.expect(1);

    let mockConsole = new MockConsole();

    let testDebugInfo = new DebugInfo(
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

    let testDebugInfo = new DebugInfo(
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
});
