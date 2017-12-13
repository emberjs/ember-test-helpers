/* globals require, Ember, jQuery */

(function() {
  if (typeof jQuery !== 'undefined') {
    var _Ember;
    if (typeof Ember !== 'undefined') {
      _Ember = Ember;
    } else {
      _Ember = require('ember').default;
    }

    var pendingRequests;
    if (Ember.__loader.registry['ember-testing/test/pending_requests']) {
      pendingRequests = Ember.__loader.require('ember-testing/test/pending_requests');
    }

    if (pendingRequests) {
      // This exists to ensure that the AJAX listeners setup by Ember itself
      // (which as of 2.17 are not properly torn down) get cleared and released
      // when the application is destroyed. Without this, any AJAX requests
      // that happen _between_ when acceptance tests will always share
      // `pendingRequests`.
      _Ember.Application.reopen({
        willDestroy() {
          jQuery(document).off('ajaxSend', pendingRequests.incrementPendingRequests);
          jQuery(document).off('ajaxComplete', pendingRequests.decrementPendingRequests);

          pendingRequests.clearPendingRequests();

          this._super.apply(this, arguments);
        },
      });
    }
  }
})();
