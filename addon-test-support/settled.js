import { run } from '@ember/runloop';

import { Promise as EmberPromise } from 'rsvp';
import jQuery from 'jquery';

import Ember from 'ember';
import global from './global';

let requests;
function incrementAjaxPendingRequests(_, xhr) {
  requests.push(xhr);
}

function decrementAjaxPendingRequests(_, xhr) {
  // In most Ember versions to date (current version is 2.16) RSVP promises are
  // configured to flush in the actions queue of the Ember run loop, however it
  // is possible that in the future this changes to use "true" micro-task
  // queues.
  //
  // The entire point here, is that _whenever_ promises are resolved, this
  // counter will decrement. In the specific case of AJAX, this means that any
  // promises chained off of `$.ajax` will properly have their `.then` called
  // _before_ this is decremented (and testing continues)
  EmberPromise.resolve().then(() => {
    for (let i = 0; i < requests.length; i++) {
      if (xhr === requests[i]) {
        requests.splice(i, 1);
      }
    }
  });
}

export function _teardownAJAXHooks() {
  if (!jQuery) {
    return;
  }

  jQuery(document).off('ajaxSend', incrementAjaxPendingRequests);
  jQuery(document).off('ajaxComplete', decrementAjaxPendingRequests);
}

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
  _internalCheckWaiters = Ember.__loader.require('ember-testing/test/waiters').checkWaiters;
}

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

export default function settled(_options) {
  let options = _options || {};
  let waitForTimers = options.hasOwnProperty('waitForTimers') ? options.waitForTimers : true;
  let waitForAJAX = options.hasOwnProperty('waitForAJAX') ? options.waitForAJAX : true;
  let waitForWaiters = options.hasOwnProperty('waitForWaiters') ? options.waitForWaiters : true;

  return new EmberPromise(function(resolve) {
    let watcher = global.setInterval(function() {
      if (waitForTimers && (run.hasScheduledTimers() || run.currentRunLoop)) {
        return;
      }

      if (waitForAJAX && requests && requests.length > 0) {
        return;
      }

      if (waitForWaiters && checkWaiters()) {
        return;
      }

      // Stop polling
      global.clearInterval(watcher);

      // Synchronously resolve the promise
      run(null, resolve);
    }, 10);
  });
}
