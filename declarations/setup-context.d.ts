import type { Resolver } from '@ember/owner';
import { type Owner } from './build-owner.ts';
import { type DeprecationFailure } from './-internal/deprecations.ts';
import { type Warning } from './-internal/warnings.ts';
export interface SetupContextOptions {
    resolver?: Resolver | undefined;
}
export type BaseContext = object;
/**
 * The public API for the test context, which test authors can depend on being
 * available.
 *
 * Note: this is *not* user-constructible; it becomes available by calling
 * `setupContext()` with a base context object.
 */
export interface TestContext extends BaseContext {
    owner: Owner;
    set<T>(key: string, value: T): T;
    setProperties<T extends Record<string, unknown>>(hash: T): T;
    get(key: string): unknown;
    getProperties(...args: string[]): Record<string, unknown>;
    pauseTest(): Promise<void>;
    resumeTest(): void;
}
export declare function isTestContext(context: BaseContext): context is TestContext;
/**
  Stores the provided context as the "global testing context".

  Generally setup automatically by `setupContext`.

  @public
  @param {Object} context the context to use
*/
export declare function setContext(context: BaseContext): void;
/**
  Retrieve the "global testing context" as stored by `setContext`.

  @public
  @returns {Object} the previously stored testing context
*/
export declare function getContext(): BaseContext | undefined;
/**
  Clear the "global testing context".

  Generally invoked from `teardownContext`.

  @public
*/
export declare function unsetContext(): void;
/**
 * Returns a promise to be used to pauses the current test (due to being
 * returned from the test itself).  This is useful for debugging while testing
 * or for test-driving.  It allows you to inspect the state of your application
 * at any point.
 *
 * The test framework wrapper (e.g. `ember-qunit` or `ember-mocha`) should
 * ensure that when `pauseTest()` is used, any framework specific test timeouts
 * are disabled.
 *
 * @public
 * @returns {Promise<void>} resolves _only_ when `resumeTest()` is invoked
 * @example <caption>Usage via ember-qunit</caption>
 *
 * import { setupRenderingTest } from 'ember-qunit';
 * import { render, click, pauseTest } from '@ember/test-helpers';
 *
 *
 * module('awesome-sauce', function(hooks) {
 *   setupRenderingTest(hooks);
 *
 *   test('does something awesome', async function(assert) {
 *     await render(hbs`{{awesome-sauce}}`);
 *
 *     // added here to visualize / interact with the DOM prior
 *     // to the interaction below
 *     await pauseTest();
 *
 *     click('.some-selector');
 *
 *     assert.equal(this.element.textContent, 'this sauce is awesome!');
 *   });
 * });
 */
export declare function pauseTest(): Promise<void>;
/**
  Resumes a test previously paused by `await pauseTest()`.

  @public
*/
export declare function resumeTest(): void;
/**
 * Returns deprecations which have occurred so far for a the current test context
 *
 * @public
 * @returns {Array<DeprecationFailure>} An array of deprecation messages
 * @example <caption>Usage via ember-qunit</caption>
 *
 * import { getDeprecations } from '@ember/test-helpers';
 *
 * module('awesome-sauce', function(hooks) {
 *   setupRenderingTest(hooks);
 *
 *   test('does something awesome', function(assert) {
       const deprecations = getDeprecations() // => returns deprecations which have occurred so far in this test
 *   });
 * });
 */
export declare function getDeprecations(): Array<DeprecationFailure>;
export type { DeprecationFailure };
/**
 * Returns deprecations which have occurred so far for a the current test context
 *
 * @public
 * @param {Function} [callback] The callback that when executed will have its DeprecationFailure recorded
 * @returns {Array<DeprecationFailure> | Promise<Array<DeprecationFailure>>} An array of deprecation messages
 * @example <caption>Usage via ember-qunit</caption>
 *
 * import { getDeprecationsDuringCallback } from '@ember/test-helpers';
 *
 * module('awesome-sauce', function(hooks) {
 *   setupRenderingTest(hooks);
 *
 *   test('does something awesome', function(assert) {
 *     const deprecations = getDeprecationsDuringCallback(() => {
 *       // code that might emit some deprecations
 *
 *     }); // => returns deprecations which occurred while the callback was invoked
 *   });
 *
 *
 *   test('does something awesome', async function(assert) {
 *     const deprecations = await getDeprecationsDuringCallback(async () => {
 *       // awaited code that might emit some deprecations
 *     }); // => returns deprecations which occurred while the callback was invoked
 *   });
 * });
 */
export declare function getDeprecationsDuringCallback(callback: () => void): Array<DeprecationFailure> | Promise<Array<DeprecationFailure>>;
/**
 * Returns warnings which have occurred so far for a the current test context
 *
 * @public
 * @returns {Array<Warning>} An array of warnings
 * @example <caption>Usage via ember-qunit</caption>
 *
 * import { getWarnings } from '@ember/test-helpers';
 *
 * module('awesome-sauce', function(hooks) {
 *   setupRenderingTest(hooks);
 *
 *   test('does something awesome', function(assert) {
       const warnings = getWarnings() // => returns warnings which have occurred so far in this test
 *   });
 * });
 */
export declare function getWarnings(): Array<Warning>;
export type { Warning };
/**
 * Returns warnings which have occurred so far for a the current test context
 *
 * @public
 * @param {Function} [callback] The callback that when executed will have its warnings recorded
 * @returns {Array<Warning> | Promise<Array<Warning>>} An array of warnings information
 * @example <caption>Usage via ember-qunit</caption>
 *
 * import { getWarningsDuringCallback } from '@ember/test-helpers';
 * import { warn } from '@ember/debug';
 *
 * module('awesome-sauce', function(hooks) {
 *   setupRenderingTest(hooks);
 *
 *   test('does something awesome', function(assert) {
 *     const warnings = getWarningsDuringCallback(() => {
 *     warn('some warning');
 *
 *     }); // => returns warnings which occurred while the callback was invoked
 *   });
 *
 *   test('does something awesome', async function(assert) {
 *     warn('some warning');
 *
 *     const warnings = await getWarningsDuringCallback(async () => {
 *       warn('some other warning');
 *     }); // => returns warnings which occurred while the callback was invoked
 *   });
 * });
 */
export declare function getWarningsDuringCallback(callback: () => void): Array<Warning> | Promise<Array<Warning>>;
/**
  Used by test framework addons to setup the provided context for testing.

  Responsible for:

  - sets the "global testing context" to the provided context (`setContext`)
  - create an owner object and set it on the provided context (e.g. `this.owner`)
  - setup `this.set`, `this.setProperties`, `this.get`, and `this.getProperties` to the provided context
  - setting up AJAX listeners
  - setting up `pauseTest` (also available as `this.pauseTest()`) and `resumeTest` helpers

  @public
  @param {Object} base the context to setup
  @param {Object} [options] options used to override defaults
  @param {Resolver} [options.resolver] a resolver to use for customizing normal resolution
  @returns {Promise<Object>} resolves with the context that was setup
*/
export default function setupContext<T extends object>(base: T, options?: SetupContextOptions): Promise<T & TestContext>;
//# sourceMappingURL=setup-context.d.ts.map