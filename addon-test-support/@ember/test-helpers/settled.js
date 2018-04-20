import { run } from '@ember/runloop';

import jQuery from 'jquery';

import Ember from 'ember';
import { nextTick } from './-utils';
import waitUntil from './wait-until';

// Ember internally tracks AJAX requests in the same way that we do here for
// legacy style "acceptance" tests using the `ember-testing.js` asset provided
// by emberjs/ember.js itself. When `@ember/test-helpers`'s `settled` utility
// is used in a legacy acceptance test context any pending AJAX requests are
// not properly considered during the `isSettled` check below.
//
// This utilizes a local utility method present in Ember since around 2.8.0 to
// properly consider pending AJAX requests done within legacy acceptance tests.
const _internalPendingRequests = (() => {
  if (Ember.__loader.registry['ember-testing/test/pending_requests']) {
    // Ember <= 3.1
    return Ember.__loader.require('ember-testing/test/pending_requests').pendingRequests;
  } else if (Ember.__loader.registry['ember-testing/lib/test/pending_requests']) {
    // Ember >= 3.2
    return Ember.__loader.require('ember-testing/lib/test/pending_requests').pendingRequests;
  }

  return () => 0;
})();

let requests;

/**
  @private
  @returns {number} the count of pending requests
*/
function pendingRequests() {
  let localRequestsPending = requests !== undefined ? requests.length : 0;
  let internalRequestsPending = _internalPendingRequests();

  return localRequestsPending + internalRequestsPending;
}

/**
  @private
  @param {Event} event (unused)
  @param {XMLHTTPRequest} xhr the XHR that has initiated a request
*/
function incrementAjaxPendingRequests(event, xhr) {
  requests.push(xhr);
}

/**
  @private
  @param {Event} event (unused)
  @param {XMLHTTPRequest} xhr the XHR that has initiated a request
*/
function decrementAjaxPendingRequests(event, xhr) {
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
  }, 0);
}

/**
  Clears listeners that were previously setup for `ajaxSend` and `ajaxComplete`.

  @private
*/
export function _teardownAJAXHooks() {
  if (!jQuery) {
    return;
  }

  jQuery(document).off('ajaxSend', incrementAjaxPendingRequests);
  jQuery(document).off('ajaxComplete', decrementAjaxPendingRequests);
}

/**
  Sets up listeners for `ajaxSend` and `ajaxComplete`.

  @private
*/
export function _setupAJAXHooks() {
  requests = [];

  if (!jQuery) {
    return;
  }

  jQuery(document).on('ajaxSend', incrementAjaxPendingRequests);
  jQuery(document).on('ajaxComplete', decrementAjaxPendingRequests);
}

let _internalCheckWaiters;
if (Ember.__loader.registry['ember-testing/test/waiters']) {
  // Ember <= 3.1
  _internalCheckWaiters = Ember.__loader.require('ember-testing/test/waiters').checkWaiters;
} else if (Ember.__loader.registry['ember-testing/lib/test/waiters']) {
  // Ember >= 3.2
  _internalCheckWaiters = Ember.__loader.require('ember-testing/lib/test/waiters').checkWaiters;
}

/**
  @private
  @returns {boolean} true if waiters are still pending
*/
function checkWaiters() {
  if (_internalCheckWaiters) {
    return _internalCheckWaiters();
  } else if (Ember.Test.waiters) {
    if (Ember.Test.waiters.any(([context, callback]) => !callback.call(context))) {
      return true;
    }
  }

  return false;
}

/**
  Check various settledness metrics, and return an object with the following properties:

  * `hasRunLoop` - Checks if a run-loop has been started. If it has, this will
    be `true` otherwise it will be `false`.
  * `hasPendingTimers` - Checks if there are scheduled timers in the run-loop.
    These pending timers are primarily registered by `Ember.run.schedule`. If
    there are pending timers, this will be `true`, otherwise `false`.
  * `hasPendingWaiters` - Checks if any registered test waiters are still
    pending (e.g. the waiter returns `true`). If there are pending waiters,
    this will be `true`, otherwise `false`.
  * `hasPendingRequests` - Checks if there are pending AJAX requests (based on
    `ajaxSend` / `ajaxComplete` events triggered by `jQuery.ajax`). If there
    are pending requests, this will be `true`, otherwise `false`.
  * `pendingRequestCount` - The count of pending AJAX requests.

  @public
  @returns {Object} object with properties for each of the metrics used to determine settledness
*/
export function getSettledState() {
  let pendingRequestCount = pendingRequests();

  return {
    hasPendingTimers: Boolean(run.hasScheduledTimers()),
    hasRunLoop: Boolean(run.currentRunLoop),
    hasPendingWaiters: checkWaiters(),
    hasPendingRequests: pendingRequestCount > 0,
    pendingRequestCount,
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
export function isSettled() {
  let { hasPendingTimers, hasRunLoop, hasPendingRequests, hasPendingWaiters } = getSettledState();

  if (hasPendingTimers || hasRunLoop || hasPendingRequests || hasPendingWaiters) {
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
export default function settled() {
  return waitUntil(isSettled, { timeout: Infinity });
}
