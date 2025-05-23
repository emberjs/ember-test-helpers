import { getOnerror, setOnerror } from '@ember/-internals/error-handling';
import { type BaseContext, getContext } from './setup-context.ts';

const cachedOnerror: Map<BaseContext, ((error: Error) => void) | undefined> =
  new Map();

/**
 * Sets the `Ember.onerror` function for tests. This value is intended to be reset after
 * each test to ensure correct test isolation. To reset, you should simply call `setupOnerror`
 * without an `onError` argument.
 *
 * @public
 * @param {Function} onError the onError function to be set on Ember.onerror
 *
 * @example <caption>Example implementation for `ember-qunit` or `ember-mocha`</caption>
 *
 * import { setupOnerror } from '@ember/test-helpers';
 *
 * test('Ember.onerror is stubbed properly', function(assert) {
 *   setupOnerror(function(err) {
 *     assert.ok(err);
 *   });
 * });
 */
export default function setupOnerror(onError?: (error: Error) => void): void {
  const context = getContext();

  if (!context) {
    throw new Error('Must setup test context before calling setupOnerror');
  }

  if (!cachedOnerror.has(context)) {
    throw new Error(
      '_cacheOriginalOnerror must be called before setupOnerror. Normally, this will happen as part of your test harness.',
    );
  }

  if (typeof onError !== 'function') {
    onError = cachedOnerror.get(context);
  }

  setOnerror(onError);
}

/**
 * Resets `Ember.onerror` to the value it originally was at the start of the test run.
 * If there is no context or cached value this is a no-op.
 *
 * @public
 *
 * @example
 *
 * import { resetOnerror } from '@ember/test-helpers';
 *
 * QUnit.testDone(function() {
 *   resetOnerror();
 * })
 */
export function resetOnerror(): void {
  const context = getContext();

  if (context && cachedOnerror.has(context)) {
    setOnerror(cachedOnerror.get(context));
  }
}

/**
 * Caches the current value of Ember.onerror. When `setupOnerror` is called without a value
 * or when `resetOnerror` is called the value will be set to what was cached here.
 *
 * @private
 * @param {BaseContext} context the text context
 */
export function _prepareOnerror(context: BaseContext) {
  if (cachedOnerror.has(context)) {
    throw new Error('_prepareOnerror should only be called once per-context');
  }

  // SAFETY: getOnerror doesn't have correct types
  cachedOnerror.set(context, getOnerror() as any);
}

/**
 * Removes the cached value of Ember.onerror.
 *
 * @private
 * @param {BaseContext} context the text context
 */
export function _cleanupOnerror(context: BaseContext) {
  resetOnerror();
  cachedOnerror.delete(context);
}
