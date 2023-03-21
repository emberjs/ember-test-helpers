import { _backburner } from '@ember/runloop';
import {
  DebugInfo as BackburnerDebugInfo,
  QueueItem,
} from '@ember/runloop/-private/backburner';
import { DebugInfoHelper, debugInfoHelpers } from './debug-info-helpers';
import { getPendingWaiterState, PendingWaiterState } from '@ember/test-waiters';

const PENDING_AJAX_REQUESTS = 'Pending AJAX requests';
const PENDING_TEST_WAITERS = 'Pending test waiters';
const SCHEDULED_ASYNC = 'Scheduled async';
const SCHEDULED_AUTORUN = 'Scheduled autorun';

type MaybeDebugInfo = BackburnerDebugInfo | null;

interface SettledState {
  hasPendingTimers: boolean;
  hasRunLoop: boolean;
  hasPendingLegacyWaiters: boolean;
  hasPendingTestWaiters: boolean;
  hasPendingRequests: boolean;
  isRenderPending: boolean;
}

interface SummaryInfo {
  hasPendingRequests: boolean;
  hasPendingLegacyWaiters: boolean;
  hasPendingTestWaiters: boolean;
  pendingTestWaiterInfo: PendingWaiterState;
  autorunStackTrace: string | undefined | null;
  pendingTimersCount: number;
  hasPendingTimers: boolean;
  pendingTimersStackTraces: (string | undefined)[];
  pendingScheduledQueueItemCount: number;
  pendingScheduledQueueItemStackTraces: (string | undefined)[];
  hasRunLoop: boolean;
  isRenderPending: boolean;
}

/**
 * The base functionality which may be present on the `SettledState` interface
 * in the `settled` module (**not** the one in this module).
 */
export default interface DebugInfo {
  toConsole: () => void;
}

/**
 * Determines if the `getDebugInfo` method is available in the
 * running verison of backburner.
 *
 * @returns {boolean} True if `getDebugInfo` is present in backburner, otherwise false.
 */
export function backburnerDebugInfoAvailable() {
  return typeof _backburner.getDebugInfo === 'function';
}

/**
 * Retrieves debug information from backburner's current deferred actions queue (runloop instance).
 * If the `getDebugInfo` method isn't available, it returns `null`.
 *
 * @public
 * @returns {MaybeDebugInfo | null} Backburner debugInfo or, if the getDebugInfo method is not present, null
 */
export function getDebugInfo(): MaybeDebugInfo {
  return _backburner.DEBUG === true && backburnerDebugInfoAvailable()
    ? <BackburnerDebugInfo>_backburner.getDebugInfo()
    : null;
}

/**
 * Encapsulates debug information for an individual test. Aggregates information
 * from:
 * - info provided by getSettledState
 *    - hasPendingTimers
 *    - hasRunLoop
 *    - hasPendingWaiters
 *    - hasPendingRequests
 * - info provided by backburner's getDebugInfo method (timers, schedules, and stack trace info)
 *
 */
export class TestDebugInfo implements DebugInfo {
  private _settledState: SettledState;
  private _debugInfo: MaybeDebugInfo;
  private _summaryInfo: SummaryInfo | undefined = undefined;

  constructor(
    settledState: SettledState,
    debugInfo: MaybeDebugInfo = getDebugInfo()
  ) {
    this._settledState = settledState;
    this._debugInfo = debugInfo;
  }

  get summary(): SummaryInfo {
    if (!this._summaryInfo) {
      this._summaryInfo = { ...(this._settledState as SummaryInfo) };

      if (this._debugInfo) {
        this._summaryInfo.autorunStackTrace =
          this._debugInfo.autorun && this._debugInfo.autorun.stack;
        this._summaryInfo.pendingTimersCount = this._debugInfo.timers.length;
        this._summaryInfo.hasPendingTimers =
          this._settledState.hasPendingTimers &&
          this._summaryInfo.pendingTimersCount > 0;
        this._summaryInfo.pendingTimersStackTraces = this._debugInfo.timers.map(
          (timer) => timer.stack
        );

        this._summaryInfo.pendingScheduledQueueItemCount =
          this._debugInfo.instanceStack
            .filter((q) => q)
            .reduce((total, item) => {
              Object.keys(item).forEach((queueName) => {
                // SAFETY: this cast is *not* safe, but the underlying type is
                // not currently able to be safer than this because it was
                // built as a bag-of-queues *and* a structured item originally.
                total += (item[queueName] as QueueItem[]).length;
              });

              return total;
            }, 0);
        this._summaryInfo.pendingScheduledQueueItemStackTraces =
          this._debugInfo.instanceStack
            .filter((q) => q)
            .reduce((stacks, deferredActionQueues) => {
              Object.keys(deferredActionQueues).forEach((queue) => {
                // SAFETY: this cast is *not* safe, but the underlying type is
                // not currently able to be safer than this because it was
                // built as a bag-of-queues *and* a structured item originally.
                (deferredActionQueues[queue] as QueueItem[]).forEach(
                  (queueItem) => queueItem.stack && stacks.push(queueItem.stack)
                );
              });
              return stacks;
            }, [] as string[]);
      }

      if (this._summaryInfo.hasPendingTestWaiters) {
        this._summaryInfo.pendingTestWaiterInfo = getPendingWaiterState();
      }
    }

    return this._summaryInfo;
  }

  toConsole(_console = console): void {
    let summary = this.summary;

    if (summary.hasPendingRequests) {
      _console.log(PENDING_AJAX_REQUESTS);
    }

    if (summary.hasPendingLegacyWaiters) {
      _console.log(PENDING_TEST_WAITERS);
    }

    if (summary.hasPendingTestWaiters) {
      if (!summary.hasPendingLegacyWaiters) {
        _console.log(PENDING_TEST_WAITERS);
      }

      Object.keys(summary.pendingTestWaiterInfo.waiters).forEach(
        (waiterName) => {
          let waiterDebugInfo =
            summary.pendingTestWaiterInfo.waiters[waiterName];

          if (Array.isArray(waiterDebugInfo)) {
            _console.group(waiterName);
            waiterDebugInfo.forEach((debugInfo) => {
              _console.log(
                `${debugInfo.label ? debugInfo.label : 'stack'}: ${
                  debugInfo.stack
                }`
              );
            });
            _console.groupEnd();
          } else {
            _console.log(waiterName);
          }
        }
      );
    }

    if (
      summary.hasPendingTimers ||
      summary.pendingScheduledQueueItemCount > 0
    ) {
      _console.group(SCHEDULED_ASYNC);

      summary.pendingTimersStackTraces.forEach((timerStack) => {
        _console.log(timerStack);
      });

      summary.pendingScheduledQueueItemStackTraces.forEach(
        (scheduleQueueItemStack) => {
          _console.log(scheduleQueueItemStack);
        }
      );

      _console.groupEnd();
    }

    if (
      summary.hasRunLoop &&
      summary.pendingTimersCount === 0 &&
      summary.pendingScheduledQueueItemCount === 0
    ) {
      _console.log(SCHEDULED_AUTORUN);

      if (summary.autorunStackTrace) {
        _console.log(summary.autorunStackTrace);
      }
    }

    debugInfoHelpers.forEach((helper: DebugInfoHelper) => {
      helper.log();
    });
  }

  _formatCount(title: string, count: number): string {
    return `${title}: ${count}`;
  }
}
