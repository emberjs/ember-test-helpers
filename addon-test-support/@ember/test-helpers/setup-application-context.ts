import { get } from '@ember/object';
import { Promise } from './-utils';
import {
  BaseContext,
  getContext,
  isTestContext,
  TestContext,
} from './setup-context';
import global from './global';
import hasEmberVersion from './has-ember-version';
import settled from './settled';
import getTestMetadata, { ITestMetadata } from './test-metadata';
import { runHooks } from './-internal/helper-hooks';

export interface ApplicationTestContext extends TestContext {
  element?: Element | null;
}

const CAN_USE_ROUTER_EVENTS = hasEmberVersion(3, 6);
let routerTransitionsPending: boolean | null = null;
const ROUTER = new WeakMap();
const HAS_SETUP_ROUTER = new WeakMap();

// eslint-disable-next-line require-jsdoc
export function isApplicationTestContext(
  context: BaseContext
): context is ApplicationTestContext {
  return isTestContext(context);
}

/**
  Determines if we have any pending router transtions (used to determine `settled` state)

  @public
  @returns {(boolean|null)} if there are pending transitions
*/
export function hasPendingTransitions(): boolean | null {
  if (CAN_USE_ROUTER_EVENTS) {
    return routerTransitionsPending;
  }

  let context = getContext();

  // there is no current context, we cannot check
  if (context === undefined) {
    return null;
  }

  let router = ROUTER.get(context);

  if (router === undefined) {
    // if there is no router (e.g. no `visit` calls made yet), we cannot
    // check for pending transitions but this is explicitly not an error
    // condition
    return null;
  }

  let routerMicrolib = router._routerMicrolib || router.router;

  if (routerMicrolib === undefined) {
    return null;
  }

  return !!routerMicrolib.activeTransition;
}

/**
  Setup the current router instance with settledness tracking. Generally speaking this
  is done automatically (during a `visit('/some-url')` invocation), but under some
  circumstances (e.g. a non-application test where you manually call `this.owner.setupRouter()`)
  you may want to call it yourself.

  @public
 */
export function setupRouterSettlednessTracking() {
  const context = getContext();
  if (context === undefined) {
    throw new Error(
      'Cannot setupRouterSettlednessTracking outside of a test context'
    );
  }

  // avoid setting up many times for the same context
  if (HAS_SETUP_ROUTER.get(context)) {
    return;
  }
  HAS_SETUP_ROUTER.set(context, true);

  let { owner } = context;
  let router;
  if (CAN_USE_ROUTER_EVENTS) {
    router = owner.lookup('service:router');

    // track pending transitions via the public routeWillChange / routeDidChange APIs
    // routeWillChange can fire many times and is only useful to know when we have _started_
    // transitioning, we can then use routeDidChange to signal that the transition has settled
    router.on('routeWillChange', () => (routerTransitionsPending = true));
    router.on('routeDidChange', () => (routerTransitionsPending = false));
  } else {
    router = owner.lookup('router:main');
    ROUTER.set(context, router);
  }

  // hook into teardown to reset local settledness state
  let ORIGINAL_WILL_DESTROY = router.willDestroy;
  router.willDestroy = function () {
    routerTransitionsPending = null;

    return ORIGINAL_WILL_DESTROY.call(this);
  };
}

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
export function visit(
  url: string,
  options?: { [key: string]: any }
): Promise<void> {
  const context = getContext();
  if (!context || !isApplicationTestContext(context)) {
    throw new Error(
      'Cannot call `visit` without having first called `setupApplicationContext`.'
    );
  }

  let { owner } = context;
  let testMetadata = getTestMetadata(context);
  testMetadata.usedHelpers.push('visit');

  return Promise.resolve()
    .then(() => {
      return runHooks('visit', 'start', url, options);
    })
    .then(() => {
      let visitResult = owner.visit(url, options);

      setupRouterSettlednessTracking();

      return visitResult;
    })
    .then(() => {
      if (global.EmberENV._APPLICATION_TEMPLATE_WRAPPER !== false) {
        context.element = document.querySelector(
          '#ember-testing > .ember-view'
        );
      } else {
        context.element = document.querySelector('#ember-testing');
      }
    })
    .then(settled)
    .then(() => {
      return runHooks('visit', 'end', url, options);
    });
}

/**
  @public
  @returns {string} the currently active route name
*/
export function currentRouteName(): string {
  const context = getContext();
  if (!context || !isApplicationTestContext(context)) {
    throw new Error(
      'Cannot call `currentRouteName` without having first called `setupApplicationContext`.'
    );
  }

  let router = context.owner.lookup('router:main');

  return get(router, 'currentRouteName');
}

const HAS_CURRENT_URL_ON_ROUTER = hasEmberVersion(2, 13);

/**
  @public
  @returns {string} the applications current url
*/
export function currentURL(): string {
  const context = getContext();
  if (!context || !isApplicationTestContext(context)) {
    throw new Error(
      'Cannot call `currentURL` without having first called `setupApplicationContext`.'
    );
  }

  let router = context.owner.lookup('router:main');

  if (HAS_CURRENT_URL_ON_ROUTER) {
    return get(router, 'currentURL');
  } else {
    return get(router, 'location').getURL();
  }
}

/**
  Used by test framework addons to setup the provided context for working with
  an application (e.g. routing).

  `setupContext` must have been run on the provided context prior to calling
  `setupApplicationContext`.

  Sets up the basic framework used by application tests.

  @public
  @param {Object} context the context to setup
  @returns {Promise<Object>} resolves with the context that was setup
*/
export default function setupApplicationContext(
  context: TestContext
): Promise<void> {
  let testMetadata: ITestMetadata = getTestMetadata(context);
  testMetadata.setupTypes.push('setupApplicationContext');

  return Promise.resolve();
}
