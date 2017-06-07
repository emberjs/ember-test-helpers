/* globals self */

import Ember from 'ember';

const jQuery = Ember.$;

var pendingRequestsCounter = 0;

function incrementPendingRequestsCounter() {
  pendingRequestsCounter++;
}

function decrementPendingRequestsCounter() {
  pendingRequestsCounter--;
}

export function _teardownAJAXHooks() {
  if (!jQuery) { return; }

  jQuery(document).off('ajaxSend', incrementPendingRequestsCounter);
  jQuery(document).off('ajaxComplete', decrementPendingRequestsCounter);
}

export function _setupAJAXHooks() {
  pendingRequestsCounter = 0;

  if (!jQuery) { return; }

  jQuery(document).on('ajaxSend', incrementPendingRequestsCounter);
  jQuery(document).on('ajaxComplete', decrementPendingRequestsCounter);
}

var _internalCheckWaiters;
if (Ember.__loader.registry['ember-testing/test/waiters']) {
  _internalCheckWaiters = Ember.__loader.require('ember-testing/test/waiters').checkWaiters;
}

function checkWaiters() {
  if (_internalCheckWaiters) {
    return _internalCheckWaiters();
  } else if (Ember.Test.waiters) {
    if (Ember.Test.waiters.any(([context, callback]) => !callback.call(context) )) {
      return true;
    }
  }

  return false;
}

function checkPendingRequests() {
  return pendingRequestsCounter > 0;
}

export default function wait(_options) {
  var options = _options || {};
  var waitForTimers = options.hasOwnProperty('waitForTimers') ? options.waitForTimers : true;
  var waitForAJAX = options.hasOwnProperty('waitForAJAX') ? options.waitForAJAX : true;
  var waitForWaiters = options.hasOwnProperty('waitForWaiters') ? options.waitForWaiters : true;

  return new Ember.RSVP.Promise(function(resolve) {
    var watcher = self.setInterval(function() {
      if (waitForTimers && (Ember.run.hasScheduledTimers() || Ember.run.currentRunLoop)) {
        return;
      }

      if (waitForAJAX && checkPendingRequests()) {
        return;
      }

      if (waitForWaiters && checkWaiters()) {
        return;
      }

      // Stop polling
      self.clearInterval(watcher);

      // Synchronously resolve the promise
      Ember.run(null, resolve);
    }, 10);
  });
}
