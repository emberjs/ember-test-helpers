/* globals jQuery, self */

import Ember from 'ember';

var requests;
function incrementAjaxPendingRequests(_, xhr) {
  requests.push(xhr);
}

function decrementAjaxPendingRequests(_, xhr) {
  for (var i = 0;i < requests.length;i++) {
    if (xhr === requests[i]) {
      requests.splice(i, 1);
    }
  }
}

export function _teardownAJAXHooks() {
  jQuery(document).off('ajaxSend', incrementAjaxPendingRequests);
  jQuery(document).off('ajaxComplete', decrementAjaxPendingRequests);
}

export function _setupAJAXHooks() {
  requests = [];

  jQuery(document).on('ajaxSend', incrementAjaxPendingRequests);
  jQuery(document).on('ajaxComplete', decrementAjaxPendingRequests);
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

      if (waitForAJAX && requests && requests.length > 0) {
        return;
      }

      if (waitForWaiters && Ember.Test.waiters && Ember.Test.waiters.any(([context, callback]) => {
            return !callback.call(context);
          })) {
        return;
      }

      // Stop polling
      self.clearInterval(watcher);

      // Synchronously resolve the promise
      Ember.run(null, resolve);
    }, 10);
  });
}
