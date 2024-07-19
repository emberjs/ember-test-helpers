// @ts-ignore: this is private API. This import will work Ember 5.1+ since it
// "provides" this public API, but does not for earlier versions. As a result,
// this type will be `any`.
import { _backburner, run } from '@ember/runloop';
import { set, setProperties, get, getProperties } from '@ember/object';
import type { Resolver } from '@ember/owner';
import { setOwner } from '@ember/application';

import buildOwner, { Owner } from './build-owner';
import { _setupAJAXHooks, _teardownAJAXHooks } from './settled';
import { _prepareOnerror } from './setup-onerror';
import Ember from 'ember';
import {
  assert,
  registerDeprecationHandler,
  registerWarnHandler,
} from '@ember/debug';
import global from './global';
import { getResolver } from './resolver';
import { getApplication } from './application';
import getTestMetadata from './test-metadata';
import {
  registerDestructor,
  associateDestroyableChild,
} from '@ember/destroyable';
import {
  getDeprecationsForContext,
  getDeprecationsDuringCallbackForContext,
  DeprecationFailure,
} from './-internal/deprecations';
import {
  getWarningsForContext,
  getWarningsDuringCallbackForContext,
  Warning,
} from './-internal/warnings';

export interface SetupContextOptions {
  resolver?: Resolver | undefined;
}

// This handler exists to provide the underlying data to enable the following methods:
// * getDeprecations()
// * getDeprecationsDuringCallback()
// * getDeprecationsDuringCallbackForContext()
registerDeprecationHandler((message, options, next) => {
  const context = getContext();
  if (context === undefined) {
    next.apply(null, [message, options]);
    return;
  }

  getDeprecationsForContext(context).push({ message, options });
  next.apply(null, [message, options]);
});

// This handler exists to provide the underlying data to enable the following methods:
// * getWarnings()
// * getWarningsDuringCallback()
// * getWarningsDuringCallbackForContext()
registerWarnHandler((message, options, next) => {
  const context = getContext();
  if (context === undefined) {
    next.apply(null, [message, options]);
    return;
  }

  getWarningsForContext(context).push({ message, options });
  next.apply(null, [message, options]);
});

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

// eslint-disable-next-line require-jsdoc
export function isTestContext(context: BaseContext): context is TestContext {
  let maybeContext = context as Record<string, unknown>;
  return (
    typeof maybeContext['pauseTest'] === 'function' &&
    typeof maybeContext['resumeTest'] === 'function'
  );
}

/**
  @private
  @param {Object} it the global object to test
  @returns {Boolean} it exists
*/
function check(it: any) {
  // Math is known to exist as a global in every environment.
  return it && it.Math === Math && it;
}

const globalObject =
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window === 'object' && window) ||
  check(typeof self === 'object' && self) ||
  // @ts-ignore -- global does not exist
  check(typeof global === 'object' && global);

/**
  Stores the provided context as the "global testing context".

  Generally setup automatically by `setupContext`.

  @public
  @param {Object} context the context to use
*/
export function setContext(context: BaseContext): void {
  globalObject.__test_context__ = context;
}

/**
  Retrieve the "global testing context" as stored by `setContext`.

  @public
  @returns {Object} the previously stored testing context
*/
export function getContext(): BaseContext | undefined {
  return globalObject.__test_context__;
}

/**
  Clear the "global testing context".

  Generally invoked from `teardownContext`.

  @public
*/
export function unsetContext(): void {
  globalObject.__test_context__ = undefined;
}

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
export function pauseTest(): Promise<void> {
  let context = getContext();

  if (!context || !isTestContext(context)) {
    throw new Error(
      'Cannot call `pauseTest` without having first called `setupTest` or `setupRenderingTest`.'
    );
  }

  return context.pauseTest();
}

/**
  Resumes a test previously paused by `await pauseTest()`.

  @public
*/
export function resumeTest(): void {
  let context = getContext();

  if (!context || !isTestContext(context)) {
    throw new Error(
      'Cannot call `resumeTest` without having first called `setupTest` or `setupRenderingTest`.'
    );
  }

  context.resumeTest();
}

/**
  @private
  @param {Object} context the test context being cleaned up
*/
function cleanup(context: BaseContext) {
  _teardownAJAXHooks();

  // SAFETY: this is intimate API *designed* for us to override.
  (Ember as any).testing = false;

  unsetContext();
}

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
export function getDeprecations(): Array<DeprecationFailure> {
  const context = getContext();

  if (!context) {
    throw new Error(
      '[@ember/test-helpers] could not get deprecations if no test context is currently active'
    );
  }

  return getDeprecationsForContext(context);
}

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
export function getDeprecationsDuringCallback(
  callback: () => void
): Array<DeprecationFailure> | Promise<Array<DeprecationFailure>> {
  const context = getContext();

  if (!context) {
    throw new Error(
      '[@ember/test-helpers] could not get deprecations if no test context is currently active'
    );
  }

  return getDeprecationsDuringCallbackForContext(context, callback);
}

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
export function getWarnings(): Array<Warning> {
  const context = getContext();

  if (!context) {
    throw new Error(
      '[@ember/test-helpers] could not get warnings if no test context is currently active'
    );
  }

  return getWarningsForContext(context);
}

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
export function getWarningsDuringCallback(
  callback: () => void
): Array<Warning> | Promise<Array<Warning>> {
  const context = getContext();

  if (!context) {
    throw new Error(
      '[@ember/test-helpers] could not get warnings if no test context is currently active'
    );
  }

  return getWarningsDuringCallbackForContext(context, callback);
}

// This WeakMap is used to track whenever a component is rendered in a test so that we can throw
// assertions when someone uses `this.{set,setProperties}` while rendering a component.
export const ComponentRenderMap = new WeakMap<BaseContext, true>();
export const SetUsage = new WeakMap<BaseContext, Array<string>>();

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
export default function setupContext<T extends object>(
  base: T,
  options: SetupContextOptions = {}
): Promise<T & TestContext> {
  let context = base as T & TestContext;

  // SAFETY: this is intimate API *designed* for us to override.
  (Ember as any).testing = true;
  setContext(context);

  let testMetadata = getTestMetadata(context);
  testMetadata.setupTypes.push('setupContext');

  _backburner.DEBUG = true;

  registerDestructor(context, cleanup);

  _prepareOnerror(context);

  return Promise.resolve()
    .then(() => {
      let application = getApplication();
      if (application) {
        return application.boot().then(() => {});
      }
      return;
    })
    .then(() => {
      let { resolver } = options;

      // This handles precedence, specifying a specific option of
      // resolver always trumps whatever is auto-detected, then we fallback to
      // the suite-wide registrations
      //
      // At some later time this can be extended to support specifying a custom
      // engine or application...
      if (resolver) {
        return buildOwner(null, resolver);
      }

      return buildOwner(getApplication(), getResolver());
    })
    .then((owner) => {
      associateDestroyableChild(context, owner);

      Object.defineProperty(context, 'owner', {
        configurable: true,
        enumerable: true,
        value: owner,
        writable: false,
      });
      setOwner(context, owner);

      Object.defineProperty(context, 'set', {
        configurable: true,
        enumerable: true,
        // SAFETY: in all of these `defineProperty` calls, we can't actually guarantee any safety w.r.t. the corresponding field's type in `TestContext`
        value(key: any, value: any): unknown {
          let ret = run(function () {
            if (ComponentRenderMap.has(context)) {
              assert(
                'You cannot call `this.set` when passing a component to `render()` (the rendered component does not have access to the test context).'
              );
            } else {
              let setCalls = SetUsage.get(context);

              if (setCalls === undefined) {
                setCalls = [];
                SetUsage.set(context, setCalls);
              }

              setCalls?.push(key);
            }

            return set(context, key, value);
          });

          return ret;
        },
        writable: false,
      });

      Object.defineProperty(context, 'setProperties', {
        configurable: true,
        enumerable: true,
        // SAFETY: in all of these `defineProperty` calls, we can't actually guarantee any safety w.r.t. the corresponding field's type in `TestContext`
        value(hash: any): unknown {
          let ret = run(function () {
            if (ComponentRenderMap.has(context)) {
              assert(
                'You cannot call `this.setProperties` when passing a component to `render()` (the rendered component does not have access to the test context)'
              );
            } else {
              // While neither the types nor the API documentation indicate that passing `null` or
              // `undefined` to `setProperties` is allowed, it works and *has worked* for a long
              // time, so there is considerable real-world code which relies on the fact that it
              // does in fact work. Checking and no-op-ing here handles that.
              if (hash != null) {
                let setCalls = SetUsage.get(context);

                if (SetUsage.get(context) === undefined) {
                  setCalls = [];
                  SetUsage.set(context, setCalls);
                }

                setCalls?.push(...Object.keys(hash));
              }
            }
            return setProperties(context, hash);
          });

          return ret;
        },
        writable: false,
      });

      Object.defineProperty(context, 'get', {
        configurable: true,
        enumerable: true,
        value(key: string): any {
          return get(context, key);
        },
        writable: false,
      });

      Object.defineProperty(context, 'getProperties', {
        configurable: true,
        enumerable: true,
        // SAFETY: in all of these `defineProperty` calls, we can't actually guarantee any safety w.r.t. the corresponding field's type in `TestContext`
        value(...args: any[]): Record<string, unknown> {
          return getProperties(context, args);
        },
        writable: false,
      });

      let resume: ((value?: void | PromiseLike<void>) => void) | undefined;
      context['resumeTest'] = function resumeTest() {
        assert(
          'Testing has not been paused. There is nothing to resume.',
          !!resume
        );
        resume();
        global.resumeTest = resume = undefined;
      };

      context['pauseTest'] = function pauseTest() {
        console.info('Testing paused. Use `resumeTest()` to continue.'); // eslint-disable-line no-console

        return new Promise((resolve) => {
          resume = resolve;
          global.resumeTest = resumeTest;
        });
      };

      _setupAJAXHooks();

      return context;
    });
}
