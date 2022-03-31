import Ember from 'ember';
import { BaseContext, getContext } from './setup-context';

let cachedOnerror: Map<BaseContext, ((error: Error) => void) | undefined> =
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
  if (typeof onError !== 'function') {
    onError = cachedOnerror.get(_getContextForOnError(true));
  }

  Ember.onerror = onError;
}

/**
 * If setup correctly, returns the test context that will be used for {@link setupOnerror}. If `throwIfNotSetup` is true, throws an error, if the test context is not setup correctly.
 *
 * @private
 * @param {Boolean} [throwIfNotSetup=false] if `true`, will throw an error instead of returning `undefined`, if the test context has not been setup for {@link setupOnerror}
 * @returns {BaseContext | undefined} the test context that will be used for{@link setupOnerror}, if setup correctly
 * @throws {Error} if test context has not been setup for {@link setupOnerror}
 */
export function _getContextForOnError(
  throwIfNotSetup: true
): BaseContext | never;
export function _getContextForOnError(
  throwIfNotSetup?: false
): BaseContext | undefined;
// eslint-disable-next-line require-jsdoc
export function _getContextForOnError(
  throwIfNotSetup = false
): BaseContext | undefined | never {
  let context = getContext();

  if (!context) {
    if (!throwIfNotSetup) return;
    throw new Error('Must setup test context before calling setupOnerror');
  }

  if (!cachedOnerror.has(context)) {
    if (!throwIfNotSetup) return;
    throw new Error(
      '_cacheOriginalOnerror must be called before setupOnerror. Normally, this will happen as part of your test harness.'
    );
  }

  return context;
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
  let context = getContext();

  if (context && cachedOnerror.has(context)) {
    Ember.onerror = cachedOnerror.get(context);
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

  cachedOnerror.set(context, Ember.onerror);
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
