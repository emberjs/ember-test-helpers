import Ember from 'ember';
import QUnit from 'qunit';

/*
 * This module is inlined here, because this library cannot depend on
 * ember-qunit directly. The implementation in this test helper is nearly
 * identical to the one used in `ember-qunit`.
 */

function unhandledRejectionAssertion(current, error) {
  let message, source;

  if (typeof error === 'object' && error !== null) {
    message = error.message;
    source = error.stack;
  } else if (typeof error === 'string') {
    message = error;
    source = 'unknown source';
  } else {
    message = 'unhandledRejection occurred, but it had no message';
    source = 'unknown source';
  }

  current.pushResult({
    result: false,
    actual: false,
    expected: true,
    message: message,
    source: source,
  });
}

export default Ember.Test.Adapter.extend({
  init() {
    this.doneCallbacks = [];
  },

  asyncStart() {
    this.doneCallbacks.push(
      QUnit.config.current ? QUnit.config.current.assert.async() : null
    );
  },

  asyncEnd() {
    let done = this.doneCallbacks.pop();
    // This can be null if asyncStart() was called outside of a test
    if (done) {
      done();
    }
  },

  exception(error) {
    unhandledRejectionAssertion(QUnit.config.current, error);
  },
});
