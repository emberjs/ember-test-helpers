import { getOnerror } from '@ember/-internals/error-handling';
import { isTesting, setTesting } from '@ember/debug';

// Private API
const VALID = Object.freeze({
  isValid: true,
  message: null
});
const INVALID = Object.freeze({
  isValid: false,
  message: 'error handler should have re-thrown the provided error'
});

/**
 * Validate the provided error handler to confirm that it properly re-throws
 * errors when `Ember.testing` is true.
 *
 * This is intended to be used by test framework hosts (or other libraries) to
 * ensure that `Ember.onerror` is properly configured. Without a check like
 * this, `Ember.onerror` could _easily_ swallow all errors and make it _seem_
 * like everything is just fine (and have green tests) when in reality
 * everything is on fire...
 *
 * @public
 * @param {Function} [callback=Ember.onerror] the callback to validate
 * @returns {Object} object with `isValid` and `message`
 *
 * @example <caption>Example implementation for `ember-qunit`</caption>
 *
 * import { validateErrorHandler } from '@ember/test-helpers';
 *
 * test('Ember.onerror is functioning properly', function(assert) {
 *   let result = validateErrorHandler();
 *   assert.ok(result.isValid, result.message);
 * });
 */
function validateErrorHandler(callback = getOnerror()) {
  if (callback === undefined || callback === null) {
    return VALID;
  }
  const error = new Error('Error handler validation error!');
  const originalEmberTesting = isTesting();
  setTesting(true);
  try {
    callback(error);
  } catch (e) {
    if (e === error) {
      return VALID;
    }
  } finally {
    setTesting(originalEmberTesting);
  }
  return INVALID;
}

export { validateErrorHandler as default };
//# sourceMappingURL=validate-error-handler.js.map
