import { type BaseContext } from './setup-context.ts';
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
export default function setupOnerror(onError?: (error: Error) => void): void;
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
export declare function resetOnerror(): void;
/**
 * Caches the current value of Ember.onerror. When `setupOnerror` is called without a value
 * or when `resetOnerror` is called the value will be set to what was cached here.
 *
 * @private
 * @param {BaseContext} context the text context
 */
export declare function _prepareOnerror(context: BaseContext): void;
/**
 * Removes the cached value of Ember.onerror.
 *
 * @private
 * @param {BaseContext} context the text context
 */
export declare function _cleanupOnerror(context: BaseContext): void;
//# sourceMappingURL=setup-onerror.d.ts.map