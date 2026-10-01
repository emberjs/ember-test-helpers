import type { DebugInfo as BackburnerDebugInfo } from '@ember/runloop/-private/backburner';
import { type PendingWaiterState } from '@ember/test-waiters';
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
export declare function backburnerDebugInfoAvailable(): boolean;
/**
 * Retrieves debug information from backburner's current deferred actions queue (runloop instance).
 * If the `getDebugInfo` method isn't available, it returns `null`.
 *
 * @public
 * @returns {MaybeDebugInfo | null} Backburner debugInfo or, if the getDebugInfo method is not present, null
 */
export declare function getDebugInfo(): MaybeDebugInfo;
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
export declare class TestDebugInfo implements DebugInfo {
    private _settledState;
    private _debugInfo;
    private _summaryInfo;
    constructor(settledState: SettledState, debugInfo?: MaybeDebugInfo);
    get summary(): SummaryInfo;
    toConsole(_console?: Console): void;
    _formatCount(title: string, count: number): string;
}
export {};
//# sourceMappingURL=debug-info.d.ts.map