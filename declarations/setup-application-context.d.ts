import { type BaseContext, type TestContext } from './setup-context.ts';
export interface ApplicationTestContext extends TestContext {
    element?: Element | null;
}
export declare function isApplicationTestContext(context: BaseContext): context is ApplicationTestContext;
/**
  Determines if we have any pending router transitions (used to determine `settled` state)

  @public
  @returns {(boolean|null)} if there are pending transitions
*/
export declare function hasPendingTransitions(): boolean | null;
/**
  Setup the current router instance with settledness tracking. Generally speaking this
  is done automatically (during a `visit('/some-url')` invocation), but under some
  circumstances (e.g. a non-application test where you manually call `this.owner.setupRouter()`)
  you may want to call it yourself.

  @public
 */
export declare function setupRouterSettlednessTracking(): void;
/**
  Navigate the application to the provided URL.

  @public
  @param {string} url The URL to visit (e.g. `/posts`)
  @param {object} options app boot options
  @returns {Promise<void>} resolves when settled

  @example
  <caption>
    Visiting the route for post 1.
  </caption>
  await visit('/posts/1');

  @example
  <caption>
    Visiting the route for post 1 while also providing the `rootElement` app boot option.
  </caption>
  await visit('/', { rootElement: '#container' });
*/
export declare function visit(url: string, options?: Record<string, unknown>): Promise<void>;
/**
  @public
  @returns {string} the currently active route name
*/
export declare function currentRouteName(): string;
/**
  @public
  @returns {string} the applications current url
*/
export declare function currentURL(): string;
/**
  Used by test framework addons to setup the provided context for working with
  an application (e.g. routing).

  `setupContext` must have been run on the provided context prior to calling
  `setupApplicationContext`.

  Sets up the basic framework used by application tests.

  @public
  @param {Object} context the context to setup
  @returns {Promise<void>} resolves when the context is set up
*/
export default function setupApplicationContext(context: TestContext): Promise<void>;
//# sourceMappingURL=setup-application-context.d.ts.map