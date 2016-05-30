/* globals self */

import Ember from 'ember';

const jQuery = Ember.$;

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
  if (!jQuery) { return; }

  jQuery(document).off('ajaxSend', incrementAjaxPendingRequests);
  jQuery(document).off('ajaxComplete', decrementAjaxPendingRequests);
}

export function _setupAJAXHooks() {
  requests = [];

  if (!jQuery) { return; }

  jQuery(document).on('ajaxSend', incrementAjaxPendingRequests);
  jQuery(document).on('ajaxComplete', decrementAjaxPendingRequests);
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

export default function wait(_options) {
  var options = _options || {};
  var waitForTimers = options.hasOwnProperty('waitForTimers') ? options.waitForTimers : true;
  var waitForAJAX = options.hasOwnProperty('waitForAJAX') ? options.waitForAJAX : true;
  var waitForWaiters = options.hasOwnProperty('waitForWaiters') ? options.waitForWaiters : true;
  var waitForTimersAndIntervals = options.hasOwnProperty('waitForTimersAndIntervals') ? options.waitForTimersAndIntervals : false;

  var ids = {};
  var originalSetInterval = window.setInterval;
  var originalClearInterval = window.clearInterval;
  var originalSetTimeout = window.setTimeout;
  var originalClearTimeout = window.clearTimeout;
  if (waitForTimersAndIntervals) {
    window.setInterval = function(fn) {
      var id;
      var args = Array.prototype.slice.call(arguments, 1);
      args.unshift(function() {
        delete ids[id];
        if (typeof fn === 'string') {
          eval(fn);
        } else {
          fn(arguments);
        }
      });
      id = originalSetInterval.apply(this, args);
      ids[id] = undefined;
      return id;
    };
    window.clearInterval = function(id) {
      delete ids[id];
      return originalClearInterval(arguments);
    };
    window.setTimeout = function(fn) {
      var id;
      var args = Array.prototype.slice.call(arguments, 1);
      args.unshift(function() {
        delete ids[id];
        if (typeof fn === 'string') {
          eval(fn);
        } else {
          fn(arguments);
        }
      });
      id = originalSetTimeout.apply(this, args);
      ids[id] = undefined;
      return id;
    };
    window.clearTimeout = function(id) {
      delete ids[id];
      return originalClearTimeout(arguments);
    };
  }

  return new Ember.RSVP.Promise(function(resolve) {
    var watcher = originalSetInterval(function() {
      if (waitForTimers && (Ember.run.hasScheduledTimers() || Ember.run.currentRunLoop)) {
        return;
      }

      if (waitForAJAX && requests && requests.length > 0) {
        return;
      }

      if (waitForWaiters && checkWaiters()) {
        return;
      }

      if (waitForTimersAndIntervals) {
        if (Object.keys(ids).length) {
          return;
        } else {
          window.setInterval = originalSetInterval;
          window.clearInterval = originalClearInterval;
          window.setTimeout = originalSetTimeout;
          window.clearTimeout = originalClearTimeout;
        }
      }

      // Stop polling
      self.clearInterval(watcher);

      // Synchronously resolve the promise
      Ember.run(null, resolve);
    }, 10);
  });
}
