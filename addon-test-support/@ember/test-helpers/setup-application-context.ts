import { get } from '@ember/object';
import {
  BaseContext,
  getContext,
  isTestContext,
  TestContext,
} from './setup-context';
import global from './global';
import settled from './settled';
import getTestMetadata from './test-metadata';
import { runHooks } from './-internal/helper-hooks';
import type Router from '@ember/routing/router';
import type RouterService from '@ember/routing/router-service';
import { assert } from '@ember/debug';

export interface ApplicationTestContext extends TestContext {
  element?: Element | null;
}

let routerTransitionsPending: boolean | null = null;
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
  return routerTransitionsPending;
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
  if (context === undefined || !isTestContext(context)) {
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
  let router: Router | RouterService;

  // SAFETY: unfortunately we cannot `assert` here at present because the
  // class is not exported, only the type, since it is not designed to be
  // sub-classed. The most we can do at present is assert that it at least
  // *exists* and assume that if it does exist, it is bound correctly.
  let routerService = owner.lookup('service:router');
  assert('router service is not set up correctly', !!routerService);
  router = routerService as RouterService;

  // track pending transitions via the public routeWillChange / routeDidChange APIs
  // routeWillChange can fire many times and is only useful to know when we have _started_
  // transitioning, we can then use routeDidChange to signal that the transition has settled
  router.on('routeWillChange', () => (routerTransitionsPending = true));
  router.on('routeDidChange', () => (routerTransitionsPending = false));

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
  options?: Record<string, unknown>
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
  let currentRouteName = get(router, 'currentRouteName');
  assert(
    'currentRouteName shoudl be a string',
    typeof currentRouteName === 'string'
  );
  return currentRouteName;
}

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

  let routerCurrentURL = get(router, 'currentURL');

  // SAFETY: this path is a lie for the sake of the public-facing types. The
  // framework itself sees this path, but users never do. A user who calls the
  // API without calling `visit()` will see an `UnrecognizedURLError`, rather
  // than getting back `null`.
  if (routerCurrentURL === null) {
    return routerCurrentURL as never as string;
  }

  assert(
    `currentUrl should be a string, but was ${typeof routerCurrentURL}`,
    typeof routerCurrentURL === 'string'
  );

  return routerCurrentURL;
}

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
export default function setupApplicationContext(
  context: TestContext
): Promise<void> {
  let testMetadata = getTestMetadata(context);
  testMetadata.setupTypes.push('setupApplicationContext');

  return Promise.resolve();
}
