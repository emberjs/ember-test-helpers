// @ts-ignore: this is private API. This import will work Ember 5.1+ since it
// "provides" this public API, but does not for earlier versions. As a result,
// this type will be `any`.
import { _backburner } from '@ember/runloop';
import { Test } from 'ember-testing';
export const checkWaiters = Test.checkWaiters;
import { pendingRequests as _internalGetPendingRequestsCount } from 'ember-testing/lib/test/pending_requests';

import { nextTick } from './-utils.ts';
import waitUntil from './wait-until.ts';
import { hasPendingTransitions } from './setup-application-context.ts';
import { hasPendingWaiters } from '@ember/test-waiters';
import type DebugInfo from './-internal/debug-info.ts';
import { TestDebugInfo } from './-internal/debug-info.ts';

let requests: XMLHttpRequest[];

/**
  @private
  @returns {number} the count of pending requests
*/
function pendingRequests() {
  const localRequestsPending = requests !== undefined ? requests.length : 0;
  const internalRequestsPending = _internalGetPendingRequestsCount();

  return localRequestsPending + internalRequestsPending;
}

/**
  @private
  @param {Event} event (unused)
  @param {XMLHTTPRequest} xhr the XHR that has initiated a request
*/
function incrementAjaxPendingRequests(event: any, xhr: XMLHttpRequest): void {
  requests.push(xhr);
}

/**
  @private
  @param {Event} event (unused)
  @param {XMLHTTPRequest} xhr the XHR that has initiated a request
*/
function decrementAjaxPendingRequests(event: any, xhr: XMLHttpRequest): void {
  // In most Ember versions to date (current version is 2.16) RSVP promises are
  // configured to flush in the actions queue of the Ember run loop, however it
  // is possible that in the future this changes to use "true" micro-task
  // queues.
  //
  // The entire point here, is that _whenever_ promises are resolved will be
  // before the next run of the JS event loop. Then in the next event loop this
  // counter will decrement. In the specific case of AJAX, this means that any
  // promises chained off of `$.ajax` will properly have their `.then` called
  // _before_ this is decremented (and testing continues)
  nextTick(() => {
    for (let i = 0; i < requests.length; i++) {
      if (xhr === requests[i]) {
        requests.splice(i, 1);
      }
    }
  });
}

/**
  Clears listeners that were previously setup for `ajaxSend` and `ajaxComplete`.

  @private
*/
export function _teardownAJAXHooks() {
  // jQuery will not invoke `ajaxComplete` if
  //    1. `transport.send` throws synchronously and
  //    2. it has an `error` option which also throws synchronously

  // We can no longer handle any remaining requests
  requests = [];

  if (typeof (globalThis as any).jQuery === 'undefined') {
    return;
  }

  (globalThis as any)
    .jQuery(document)
    .off('ajaxSend', incrementAjaxPendingRequests);
  (globalThis as any)
    .jQuery(document)
    .off('ajaxComplete', decrementAjaxPendingRequests);
}

/**
  Sets up listeners for `ajaxSend` and `ajaxComplete`.

  @private
*/
export function _setupAJAXHooks() {
  requests = [];

  if (typeof (globalThis as any).jQuery === 'undefined') {
    return;
  }

  (globalThis as any)
    .jQuery(document)
    .on('ajaxSend', incrementAjaxPendingRequests);
  (globalThis as any)
    .jQuery(document)
    .on('ajaxComplete', decrementAjaxPendingRequests);
}

export interface SettledState {
  hasRunLoop: boolean;
  hasPendingTimers: boolean;
  hasPendingWaiters: boolean;
  hasPendingRequests: boolean;
  hasPendingTransitions: boolean | null;
  isRenderPending: boolean;
  pendingRequestCount: number;
  debugInfo: DebugInfo;
}

/**
  Check various settledness metrics, and return an object with the following properties:

  - `hasRunLoop` - Checks if a run-loop has been started. If it has, this will
    be `true` otherwise it will be `false`.
  - `hasPendingTimers` - Checks if there are scheduled timers in the run-loop.
    These pending timers are primarily registered by `Ember.run.schedule`. If
    there are pending timers, this will be `true`, otherwise `false`.
  - `hasPendingWaiters` - Checks if any registered test waiters are still
    pending (e.g. the waiter returns `true`). If there are pending waiters,
    this will be `true`, otherwise `false`.
  - `hasPendingRequests` - Checks if there are pending AJAX requests (based on
    `ajaxSend` / `ajaxComplete` events triggered by `jQuery.ajax`). If there
    are pending requests, this will be `true`, otherwise `false`.
  - `hasPendingTransitions` - Checks if there are pending route transitions. If the
    router has not been instantiated / setup for the test yet this will return `null`,
    if there are pending transitions, this will be `true`, otherwise `false`.
  - `pendingRequestCount` - The count of pending AJAX requests.
  - `debugInfo` - Debug information that's combined with info return from backburner's
    getDebugInfo method.
  - `isRenderPending` - Checks if there are any pending render operations. This will be true as long
    as there are tracked values in the template that have not been rerendered yet.

  @public
  @returns {Object} object with properties for each of the metrics used to determine settledness
*/
export function getSettledState(): SettledState {
  const hasPendingTimers = _backburner.hasTimers();
  const hasRunLoop = Boolean(_backburner.currentInstance);
  const hasPendingLegacyWaiters = checkWaiters();
  const hasPendingTestWaiters = hasPendingWaiters();
  const pendingRequestCount = pendingRequests();
  const hasPendingRequests = pendingRequestCount > 0;
  // TODO: Ideally we'd have a function in Ember itself that can synchronously identify whether
  // or not there are any pending render operations, but this will have to suffice for now
  const isRenderPending = !!hasRunLoop;

  return {
    hasPendingTimers,
    hasRunLoop,
    hasPendingWaiters: hasPendingLegacyWaiters || hasPendingTestWaiters,
    hasPendingRequests,
    hasPendingTransitions: hasPendingTransitions(),
    isRenderPending,
    pendingRequestCount,
    debugInfo: new TestDebugInfo({
      hasPendingTimers,
      hasRunLoop,
      hasPendingLegacyWaiters,
      hasPendingTestWaiters,
      hasPendingRequests,
      isRenderPending,
    }),
  };
}

/**
  Checks various settledness metrics (via `getSettledState()`) to determine if things are settled or not.

  Settled generally means that there are no pending timers, no pending waiters,
  no pending AJAX requests, and no current run loop. However, new settledness
  metrics may be added and used as they become available.

  @public
  @returns {boolean} `true` if settled, `false` otherwise
*/
export function isSettled(): boolean {
  const {
    hasPendingTimers,
    hasRunLoop,
    hasPendingRequests,
    hasPendingWaiters,
    hasPendingTransitions,
    isRenderPending,
  } = getSettledState();

  if (
    hasPendingTimers ||
    hasRunLoop ||
    hasPendingRequests ||
    hasPendingWaiters ||
    hasPendingTransitions ||
    isRenderPending
  ) {
    return false;
  }

  return true;
}

/**
  Returns a promise that resolves when in a settled state (see `isSettled` for
  a definition of "settled state").

  @public
  @returns {Promise<void>} resolves when settled
*/
export default function settled(): Promise<void> {
  return waitUntil(isSettled, { timeout: Infinity }).then(() => {});
}
