import { _backburner, run } from '@ember/runloop';
import EmberObject, { set, setProperties, get, getProperties } from '@ember/object';
import Application, { setOwner } from '@ember/application';
import ApplicationInstance from '@ember/application/instance';
import { Registry } from '@ember/-internals/container';
import { RegistryProxyMixin, ContainerProxyMixin } from '@ember/-internals/runtime';
import { Test } from 'ember-testing';
import { setOnerror, getOnerror } from '@ember/-internals/error-handling';
import { assert, registerDeprecationHandler, registerWarnHandler, setTesting } from '@ember/debug';
import getTestMetadata from './test-metadata.js';
import { getDeprecationsForContext, getDeprecationsDuringCallbackForContext } from './-internal/deprecations.js';
import { getWarningsForContext, getWarningsDuringCallbackForContext } from './-internal/warnings.js';
import hasEmberVersion from './has-ember-version.js';
import { hasPendingWaiters } from '@ember/test-waiters';
import { TestDebugInfo } from './-internal/debug-info.js';

let __resolver__;

/**
  Stores the provided resolver instance so that tests being ran can resolve
  objects in the same way as a normal application.

  Used by `setupContext` and `setupRenderingContext` as a fallback when `setApplication` was _not_ used.

  @public
  @param {Ember.Resolver} resolver the resolver to be used for testing
*/
function setResolver(resolver) {
  __resolver__ = resolver;
}

/**
  Retrieve the resolver instance stored by `setResolver`.

  @public
  @returns {Ember.Resolver} the previously stored resolver
*/
function getResolver() {
  return __resolver__;
}

let __application__;

/**
  Stores the provided application instance so that tests being ran will be aware of the application under test.

  - Required by `setupApplicationContext` method.
  - Used by `setupContext` and `setupRenderingContext` when present.

  @public
  @param {Ember.Application} application the application that will be tested
*/
function setApplication(application) {
  __application__ = application;

  /**
   * For RFC#1132, the strict resolver is not accessible.
   * It is closed off from extension.
   *
   * SAFETY: modules is a new API, so older Application
   *         types will not have it.
   */
  if (application?.modules) return;
  if (!getResolver()) {
    const Resolver = application.Resolver;
    const resolver = Resolver.create({
      namespace: application
    });
    setResolver(resolver);
  }
}

/**
  Retrieve the application instance stored by `setApplication`.

  @public
  @returns {Ember.Application} the previously stored application instance under test
*/
function getApplication() {
  return __application__;
}

/**
 * Adds methods that are normally only on registry to the container. This is largely to support the legacy APIs
 * that are not using `owner` (but are still using `this.container`).
 *
 * @private
 * @param {Object} container  the container to modify
 */
function exposeRegistryMethodsWithoutDeprecations(container) {
  const methods = ['register', 'unregister', 'resolve', 'normalize', 'typeInjection', 'injection', 'factoryInjection', 'factoryTypeInjection', 'has', 'options', 'optionsForType'];
  for (let i = 0, l = methods.length; i < l; i++) {
    const methodName = methods[i];
    if (methodName && methodName in container) {
      const knownMethod = methodName;
      container[knownMethod] = function (...args) {
        return container._registry[knownMethod](...args);
      };
    }
  }
}

// NOTE: this is the same as what `EngineInstance`/`ApplicationInstance`
// implement, and is thus a superset of the `InternalOwner` contract from Ember
// itself.
// This is the same merging pattern Ember itself uses for `Engine` etc.: the
// interface reflects the mixins actually applied in the `extends` clause.
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class Owner extends EmberObject.extend(RegistryProxyMixin, ContainerProxyMixin) {
  _emberTestHelpersMockOwner = true;

  /* eslint-disable valid-jsdoc */
  /**
   * Unregister a factory and its instance.
   *
   * Overrides `RegistryProxy#unregister` in order to clear any cached instances
   * of the unregistered factory.
   *
   * @param {string} fullName Name of the factory to unregister.
   *
   * @see {@link https://github.com/emberjs/ember.js/pull/12680}
   * @see {@link https://github.com/emberjs/ember.js/blob/v4.5.0-alpha.5/packages/%40ember/engine/instance.ts#L152-L167}
   */
  /* eslint-enable valid-jsdoc */
  unregister(fullName) {
    // SAFETY: this is always present, but only the stable type definitions from
    // Ember actually preserve it, since it is private API.
    this['__container__'].reset(fullName);

    // We overwrote this method from RegistryProxyMixin.
    // SAFETY: this is always present, but only the stable type definitions from
    // Ember actually preserve it, since it is private API.
    this['__registry__'].unregister(fullName);
  }
}

/**
 * @private
 * @param {Object} resolver the resolver to use with the registry
 * @returns {Object} owner, container, registry
 */
function buildRegistry(resolver) {
  const namespace = new Application();
  // @ts-ignore: this is actually the correcct type, but there was a typo in
  // Ember's docs for many years which meant that there was a matching problem
  // in the types for Ember's definition of `Engine`. Once we require at least
  // Ember 5.1 (in some future breaking change), this ts-ignore can be removed.
  namespace.Resolver = {
    create() {
      return resolver;
    }
  };

  // @ts-ignore: this is private API.
  const fallbackRegistry = Application.buildRegistry(namespace);
  const registry = new Registry({
    fallback: fallbackRegistry
  });

  // @ts-ignore: this is private API.
  ApplicationInstance.setupRegistry(registry);

  // these properties are set on the fallback registry by `buildRegistry`
  // and on the primary registry within the ApplicationInstance constructor
  // but we need to manually recreate them since ApplicationInstance's are not
  // exposed externally
  // @ts-ignore: this is private API.
  registry.normalizeFullName = fallbackRegistry.normalizeFullName;
  // @ts-ignore: this is private API.
  registry.makeToString = fallbackRegistry.makeToString;
  // @ts-ignore: this is private API.
  registry.describe = fallbackRegistry.describe;
  const owner = Owner.create({
    // @ts-ignore -- we do not have type safety for `Object.extend` so the type
    // of `Owner` here is just `EmberObject`, but we *do* constrain it to allow
    // only types from the actual class, so these fields are not accepted.
    // However, we can see that they are valid, based on the definition of
    // `Owner` above given that it fulfills the `InternalOwner` contract and
    // also extends it just as `EngineInstance` does internally.
    //
    // NOTE: we use an `ignore` directive rather than `expect-error` because in
    // *some* versions of the types, we *do* have (at least some of) this
    // safety, and maximal backwards compatibility means we have to account for
    // that.
    __registry__: registry,
    __container__: null
  });

  // @ts-ignore: this is private API.
  const container = registry.container({
    owner: owner
  });
  // @ts-ignore: this is private API.
  owner.__container__ = container;
  exposeRegistryMethodsWithoutDeprecations(container);
  return {
    registry,
    container,
    owner
  };
}

/**
  Creates an "owner" (an object that either _is_ or duck-types like an
  `Ember.ApplicationInstance`) from the provided options.

  If `options.application` is present (e.g. setup by an earlier call to
  `setApplication`) an `Ember.ApplicationInstance` is built via
  `application.buildInstance()`.

  If `options.application` is not present, we fall back to using
  `options.resolver` instead (setup via `setResolver`). This creates a mock
  "owner" by using a custom created combination of `Ember.Registry`,
  `Ember.Container`, `Ember._ContainerProxyMixin`, and
  `Ember._RegistryProxyMixin`.

  @private
  @param {Ember.Application} [application] the Ember.Application to build an instance from
  @param {Ember.Resolver} [resolver] the resolver to use to back a "mock owner"
  @returns {Promise<Ember.ApplicationInstance>} a promise resolving to the generated "owner"
*/
function buildOwner(application, resolver) {
  if (application) {
    // @ts-ignore: this type is correct and will check against Ember 4.12 or 5.1
    // or later. However, the first round of preview types in Ember 4.8 does not
    // include the `visit` API (it was missing for many years!) and therefore
    // there is no way to make this assignable accross all supported versions.
    return application.boot().then(app => app.buildInstance().boot());
  }
  if (!resolver) {
    throw new Error('You must set up the ember-test-helpers environment with either `setResolver` or `setApplication` before running any tests.');
  }
  const {
    owner
  } = buildRegistry(resolver);
  return Promise.resolve(owner);
}

// eslint-disable-next-line require-jsdoc
function isElement(target) {
  return target !== null && typeof target === 'object' && Reflect.get(target, 'nodeType') === Node.ELEMENT_NODE;
}

// eslint-disable-next-line require-jsdoc
function isWindow(target) {
  return target instanceof Window;
}

// eslint-disable-next-line require-jsdoc
function isDocument(target) {
  return target !== null && typeof target === 'object' && Reflect.get(target, 'nodeType') === Node.DOCUMENT_NODE;
}

// eslint-disable-next-line require-jsdoc
function isContentEditable(element) {
  return 'isContentEditable' in element && element.isContentEditable;
}

const FORM_CONTROL_TAGS = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'];
/**
  @private
  @param {Element} element the element to check
  @returns {boolean} `true` when the element is a form control, `false` otherwise
*/
function isFormControl(element) {
  return !isWindow(element) && !isDocument(element) && FORM_CONTROL_TAGS.indexOf(element.tagName) > -1 && element.type !== 'hidden';
}

/* globals Promise */

const nextTick = cb => Promise.resolve().then(cb);
const futureTick = setTimeout;

/**
 Returns whether the passed in string consists only of numeric characters.

 @private
 @param {string} n input string
 @returns {boolean} whether the input string consists only of numeric characters
 */
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(Number(n));
}

/**
  Checks if an element is considered visible by the focus area spec.

  @private
  @param {Element} element the element to check
  @returns {boolean} `true` when the element is visible, `false` otherwise
*/
function isVisible(element) {
  const styles = window.getComputedStyle(element);
  return styles.display !== 'none' && styles.visibility !== 'hidden';
}

/**
  Checks if an element is disabled.

  @private
  @param {Element} element the element to check
  @returns {boolean} `true` when the element is disabled, `false` otherwise
*/
function isDisabled(element) {
  if (isFormControl(element)) {
    return element.disabled;
  }
  return false;
}

const TIMEOUTS = [0, 1, 2, 5, 7];
const MAX_TIMEOUT = 10;
/**
  Wait for the provided callback to return a truthy value.

  This does not leverage `settled()`, and as such can be used to manage async
  while _not_ settled (e.g. "loading" or "pending" states).

  @public
  @param {Function} callback the callback to use for testing when waiting should stop
  @param {Object} [options] options used to override defaults
  @param {number} [options.timeout=1000] the maximum amount of time to wait
  @param {string} [options.timeoutMessage='waitUntil timed out'] the message to use in the reject on timeout
  @returns {Promise} resolves with the callback value when it returns a truthy value

  @example
  <caption>
    Waiting until a selected element displays text:
  </caption>
  await waitUntil(function() {
    return find('.my-selector').textContent.includes('something')
  }, { timeout: 2000 })
*/
function waitUntil(callback, options = {}) {
  const timeout = 'timeout' in options ? options.timeout : 1000;
  const timeoutMessage = 'timeoutMessage' in options ? options.timeoutMessage : 'waitUntil timed out';

  // creating this error eagerly so it has the proper invocation stack
  const waitUntilTimedOut = new Error(timeoutMessage);
  return new Promise(function (resolve, reject) {
    let time = 0;

    // eslint-disable-next-line require-jsdoc
    function scheduleCheck(timeoutsIndex) {
      const knownTimeout = TIMEOUTS[timeoutsIndex];
      const interval = knownTimeout === undefined ? MAX_TIMEOUT : knownTimeout;
      futureTick(function () {
        time += interval;
        let value;
        try {
          value = callback();
        } catch (error) {
          reject(error);
          return;
        }
        if (value) {
          resolve(value);
        } else if (time < timeout) {
          scheduleCheck(timeoutsIndex + 1);
        } else {
          reject(waitUntilTimedOut);
          return;
        }
      }, interval);
    }
    scheduleCheck(0);
  });
}

const registeredHooks = new Map();

/**
 * @private
 * @param {string} helperName The name of the test helper in which to run the hook.
 * @param {string} label A label to help identify the hook.
 * @returns {string} The compound key for the helper.
 */
function getHelperKey(helperName, label) {
  return `${helperName}:${label}`;
}

/**
 * Registers a function to be run during the invocation of a test helper.
 *
 * @param {string} helperName The name of the test helper in which to run the hook.
 *                            Test helper names include `blur`, `click`, `doubleClick`, `fillIn`,
 *                            `fireEvent`, `focus`, `render`, `scrollTo`, `select`, `tab`, `tap`, `triggerEvent`,
 *                            `triggerKeyEvent`, `typeIn`, and `visit`.
 * @param {string} label A label to help identify the hook. Built-in labels include `start`, `end`,
 *                       and `targetFound`, the former designating either the start or end of
 *                       the helper invocation.
 * @param {Function} hook The hook function to run when the test helper is invoked.
 * @returns {HookUnregister} An object containing an `unregister` function that unregisters
 *                           the specific hook initially registered to the helper.
 * @example
 * <caption>
 *   Registering a hook for the `end` point of the `click` test helper invocation
 * </caption>
 *
 * const hook = registerHook('click', 'end', () => {
 *   console.log('Running `click:end` test helper hook');
 * });
 *
 * // Unregister the hook at some later point in time
 * hook.unregister();
 */
function registerHook(helperName, label, hook) {
  const helperKey = getHelperKey(helperName, label);
  let hooksForHelper = registeredHooks.get(helperKey);
  if (hooksForHelper === undefined) {
    hooksForHelper = new Set();
    registeredHooks.set(helperKey, hooksForHelper);
  }
  hooksForHelper.add(hook);
  return {
    unregister() {
      hooksForHelper.delete(hook);
    }
  };
}

/**
 * Runs all hooks registered for a specific test helper.
 *
 * @param {string} helperName The name of the test helper in which to run the hook.
 *                            Test helper names include `blur`, `click`, `doubleClick`, `fillIn`,
 *                            `fireEvent`, `focus`, `render`, `scrollTo`, `select`, `tab`, `tap`, `triggerEvent`,
 *                            `triggerKeyEvent`, `typeIn`, and `visit`.
 * @param {string} label A label to help identify the hook. Built-in labels include `start`, `end`,
 *                       and `targetFound`, the former designating either the start or end of
 *                       the helper invocation.
 * @param {unknown[]} args Any arguments originally passed to the test helper.
 * @returns {Promise<void>} A promise representing the serial invocation of the hooks.
 */
function runHooks(helperName, label, ...args) {
  const hooks = registeredHooks.get(getHelperKey(helperName, label)) || new Set();
  const promises = [];
  hooks.forEach(hook => {
    const hookResult = hook(...args);
    promises.push(hookResult);
  });
  return Promise.all(promises).then(() => {});
}

const CAN_USE_ROUTER_EVENTS = hasEmberVersion(3, 6);
let routerTransitionsPending = null;
const ROUTER = new WeakMap();
const HAS_SETUP_ROUTER = new WeakMap();

// eslint-disable-next-line require-jsdoc
function isApplicationTestContext(context) {
  return isTestContext(context);
}

/**
  Determines if we have any pending router transitions (used to determine `settled` state)

  @public
  @returns {(boolean|null)} if there are pending transitions
*/
function hasPendingTransitions() {
  if (CAN_USE_ROUTER_EVENTS) {
    return routerTransitionsPending;
  }
  const context = getContext();

  // there is no current context, we cannot check
  if (context === undefined) {
    return null;
  }
  const router = ROUTER.get(context);
  if (router === undefined) {
    // if there is no router (e.g. no `visit` calls made yet), we cannot
    // check for pending transitions but this is explicitly not an error
    // condition
    return null;
  }
  const routerMicrolib = router._routerMicrolib || router.router;
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
function setupRouterSettlednessTracking() {
  const context = getContext();
  if (context === undefined || !isTestContext(context)) {
    throw new Error('Cannot setupRouterSettlednessTracking outside of a test context');
  }

  // avoid setting up many times for the same context
  if (HAS_SETUP_ROUTER.get(context)) {
    return;
  }
  HAS_SETUP_ROUTER.set(context, true);
  const {
    owner
  } = context;
  let router;
  if (CAN_USE_ROUTER_EVENTS) {
    // SAFETY: unfortunately we cannot `assert` here at present because the
    // class is not exported, only the type, since it is not designed to be
    // sub-classed. The most we can do at present is assert that it at least
    // *exists* and assume that if it does exist, it is bound correctly.
    const routerService = owner.lookup('service:router');
    assert('router service is not set up correctly', !!routerService);
    router = routerService;

    // track pending transitions via the public routeWillChange / routeDidChange APIs
    // routeWillChange can fire many times and is only useful to know when we have _started_
    // transitioning, we can then use routeDidChange to signal that the transition has settled
    router.on('routeWillChange', () => routerTransitionsPending = true);
    router.on('routeDidChange', () => routerTransitionsPending = false);
  } else {
    // SAFETY: similarly, this cast cannot be made safer because on the versions
    // where we fall into this path, this is *also* not an exported class.
    const mainRouter = owner.lookup('router:main');
    assert('router:main is not available', !!mainRouter);
    router = mainRouter;
    ROUTER.set(context, router);
  }

  // hook into teardown to reset local settledness state
  const ORIGINAL_WILL_DESTROY = router.willDestroy;
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
function visit(url, options) {
  const context = getContext();
  if (!context || !isApplicationTestContext(context)) {
    throw new Error('Cannot call `visit` without having first called `setupApplicationContext`.');
  }
  const {
    owner
  } = context;
  const testMetadata = getTestMetadata(context);
  testMetadata.usedHelpers.push('visit');
  return Promise.resolve().then(() => {
    return runHooks('visit', 'start', url, options);
  }).then(() => {
    const visitResult = owner.visit(url, options);
    setupRouterSettlednessTracking();
    return visitResult;
  }).then(() => {
    context.element = document.querySelector('#ember-testing');
  }).then(settled).then(() => {
    return runHooks('visit', 'end', url, options);
  });
}

/**
  @public
  @returns {string} the currently active route name
*/
function currentRouteName() {
  const context = getContext();
  if (!context || !isApplicationTestContext(context)) {
    throw new Error('Cannot call `currentRouteName` without having first called `setupApplicationContext`.');
  }
  const router = context.owner.lookup('router:main');
  const currentRouteName = router.currentRouteName;
  assert('currentRouteName should be a string', typeof currentRouteName === 'string');
  return currentRouteName;
}
const HAS_CURRENT_URL_ON_ROUTER = hasEmberVersion(2, 13);

/**
  @public
  @returns {string} the applications current url
*/
function currentURL() {
  const context = getContext();
  if (!context || !isApplicationTestContext(context)) {
    throw new Error('Cannot call `currentURL` without having first called `setupApplicationContext`.');
  }
  const router = context.owner.lookup('router:main');
  if (HAS_CURRENT_URL_ON_ROUTER) {
    const routerCurrentURL = router.currentURL;

    // SAFETY: this path is a lie for the sake of the public-facing types. The
    // framework itself sees this path, but users never do. A user who calls the
    // API without calling `visit()` will see an `UnrecognizedURLError`, rather
    // than getting back `null`.
    if (routerCurrentURL === null) {
      return routerCurrentURL;
    }
    assert(`currentUrl should be a string, but was ${typeof routerCurrentURL}`, typeof routerCurrentURL === 'string');
    return routerCurrentURL;
  } else {
    // SAFETY: this is *positively ancient* and should probably be removed at
    // some point; old routers which don't have `currentURL` *should* have a
    // `location` with `getURL()` per the docs for 2.12.
    return router.location.getURL();
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
  @returns {Promise<void>} resolves when the context is set up
*/
function setupApplicationContext(context) {
  const testMetadata = getTestMetadata(context);
  testMetadata.setupTypes.push('setupApplicationContext');
  return Promise.resolve();
}

// @ts-ignore: this is private API. This import will work Ember 5.1+ since it
// "provides" this public API, but does not for earlier versions. As a result,
// this type will be `any`.
let requests;
const checkWaiters = Test.checkWaiters;

/**
  @private
  @returns {number} the count of pending requests
*/
function pendingRequests() {
  return requests !== undefined ? requests.length : 0;
}

/**
  @private
  @param {Event} event (unused)
  @param {XMLHTTPRequest} xhr the XHR that has initiated a request
*/
function incrementAjaxPendingRequests(event, xhr) {
  requests.push(xhr);
}

/**
  @private
  @param {Event} event (unused)
  @param {XMLHTTPRequest} xhr the XHR that has initiated a request
*/
function decrementAjaxPendingRequests(event, xhr) {
  // In most Ember versions to date (current version is 2.16) RSVP promises are
  // configured to flush in the actions queue of the Ember run loop, however it
  // is possible that in the future this changes to use "true" micro-task
  // queues.
  //
  // The entire point here, is that _whenever_ promises are resolved will be
  // before the next run of the JS event loop. Then in the next event loop this
  // counter will decrement. In the specific case of AJAX, this means that any
  // promises chained off of `$.ajax` will properly have their `.then` called
  // _before_ this is decremented (and testing continues)
  nextTick(() => {
    for (let i = 0; i < requests.length; i++) {
      if (xhr === requests[i]) {
        requests.splice(i, 1);
      }
    }
  });
}

/**
  Clears listeners that were previously setup for `ajaxSend` and `ajaxComplete`.

  @private
*/
function _teardownAJAXHooks() {
  // jQuery will not invoke `ajaxComplete` if
  //    1. `transport.send` throws synchronously and
  //    2. it has an `error` option which also throws synchronously

  // We can no longer handle any remaining requests
  requests = [];
  if (typeof globalThis.jQuery === 'undefined') {
    return;
  }
  globalThis.jQuery(document).off('ajaxSend', incrementAjaxPendingRequests);
  globalThis.jQuery(document).off('ajaxComplete', decrementAjaxPendingRequests);
}

/**
  Sets up listeners for `ajaxSend` and `ajaxComplete`.

  @private
*/
function _setupAJAXHooks() {
  requests = [];
  if (typeof globalThis.jQuery === 'undefined') {
    return;
  }
  globalThis.jQuery(document).on('ajaxSend', incrementAjaxPendingRequests);
  globalThis.jQuery(document).on('ajaxComplete', decrementAjaxPendingRequests);
}
/**
  Check various settledness metrics, and return an object with the following properties:

  - `hasRunLoop` - Checks if a run-loop has been started. If it has, this will
    be `true` otherwise it will be `false`.
  - `hasPendingTimers` - Checks if there are scheduled timers in the run-loop.
    These pending timers are primarily registered by `Ember.run.schedule`. If
    there are pending timers, this will be `true`, otherwise `false`.
  - `hasPendingWaiters` - Checks if any registered test waiters are still
    pending (e.g. the waiter returns `true`). If there are pending waiters,
    this will be `true`, otherwise `false`.
  - `hasPendingRequests` - Checks if there are pending AJAX requests (based on
    `ajaxSend` / `ajaxComplete` events triggered by `jQuery.ajax`). If there
    are pending requests, this will be `true`, otherwise `false`.
  - `hasPendingTransitions` - Checks if there are pending route transitions. If the
    router has not been instantiated / setup for the test yet this will return `null`,
    if there are pending transitions, this will be `true`, otherwise `false`.
  - `pendingRequestCount` - The count of pending AJAX requests.
  - `debugInfo` - Debug information that's combined with info return from backburner's
    getDebugInfo method.
  - `isRenderPending` - Checks if there are any pending render operations. This will be true as long
    as there are tracked values in the template that have not been rerendered yet.

  @public
  @returns {Object} object with properties for each of the metrics used to determine settledness
*/
function getSettledState() {
  const hasPendingTimers = _backburner.hasTimers();
  const hasRunLoop = Boolean(_backburner.currentInstance);
  const hasPendingLegacyWaiters = checkWaiters();
  const hasPendingTestWaiters = hasPendingWaiters();
  const pendingRequestCount = pendingRequests();
  const hasPendingRequests = pendingRequestCount > 0;
  // TODO: Ideally we'd have a function in Ember itself that can synchronously identify whether
  // or not there are any pending render operations, but this will have to suffice for now
  const isRenderPending = !!hasRunLoop;
  return {
    hasPendingTimers,
    hasRunLoop,
    hasPendingWaiters: hasPendingLegacyWaiters || hasPendingTestWaiters,
    hasPendingRequests,
    hasPendingTransitions: hasPendingTransitions(),
    isRenderPending,
    pendingRequestCount,
    debugInfo: new TestDebugInfo({
      hasPendingTimers,
      hasRunLoop,
      hasPendingLegacyWaiters,
      hasPendingTestWaiters,
      hasPendingRequests,
      isRenderPending
    })
  };
}

/**
  Checks various settledness metrics (via `getSettledState()`) to determine if things are settled or not.

  Settled generally means that there are no pending timers, no pending waiters,
  no pending AJAX requests, and no current run loop. However, new settledness
  metrics may be added and used as they become available.

  @public
  @returns {boolean} `true` if settled, `false` otherwise
*/
function isSettled() {
  const {
    hasPendingTimers,
    hasRunLoop,
    hasPendingRequests,
    hasPendingWaiters,
    hasPendingTransitions,
    isRenderPending
  } = getSettledState();
  if (hasPendingTimers || hasRunLoop || hasPendingRequests || hasPendingWaiters || hasPendingTransitions || isRenderPending) {
    return false;
  }
  return true;
}

/**
  Returns a promise that resolves when in a settled state (see `isSettled` for
  a definition of "settled state").

  @public
  @returns {Promise<void>} resolves when settled
*/
function settled() {
  return waitUntil(isSettled, {
    timeout: Infinity
  }).then(() => {});
}

const cachedOnerror = new Map();

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
function setupOnerror(onError) {
  const context = getContext();
  if (!context) {
    throw new Error('Must setup test context before calling setupOnerror');
  }
  if (!cachedOnerror.has(context)) {
    throw new Error('_cacheOriginalOnerror must be called before setupOnerror. Normally, this will happen as part of your test harness.');
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
function resetOnerror() {
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
function _prepareOnerror(context) {
  if (cachedOnerror.has(context)) {
    throw new Error('_prepareOnerror should only be called once per-context');
  }

  // SAFETY: getOnerror doesn't have correct types
  cachedOnerror.set(context, getOnerror());
}

/**
 * Removes the cached value of Ember.onerror.
 *
 * @private
 * @param {BaseContext} context the text context
 */
function _cleanupOnerror(context) {
  resetOnerror();
  cachedOnerror.delete(context);
}

/* globals global */

var global$1 = (() => {
  if (typeof self !== 'undefined') {
    return self;
  } else if (typeof window !== 'undefined') {
    return window;
    // @ts-ignore -- global does not exist
  } else if (typeof global !== 'undefined') {
    // @ts-ignore -- global does not exist
    return global;
  } else {
    return Function('return this')();
  }
})();

// @ts-ignore: this is private API. This import will work Ember 5.1+ since it
// "provides" this public API, but does not for earlier versions. As a result,
// this type will be `any`.
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
  getDeprecationsForContext(context).push({
    message,
    options
  });
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
  getWarningsForContext(context).push({
    message,
    options
  });
  next.apply(null, [message, options]);
});

/**
 * The public API for the test context, which test authors can depend on being
 * available.
 *
 * Note: this is *not* user-constructible; it becomes available by calling
 * `setupContext()` with a base context object.
 */

// eslint-disable-next-line require-jsdoc
function isTestContext(context) {
  const maybeContext = context;
  return typeof maybeContext['pauseTest'] === 'function' && typeof maybeContext['resumeTest'] === 'function';
}

/**
  @private
  @param {Object} it the global object to test
  @returns {Boolean} it exists
*/
function check(it) {
  // Math is known to exist as a global in every environment.
  return it && it.Math === Math && it;
}
const globalObject = check(typeof globalThis == 'object' && globalThis) || check(typeof window === 'object' && window) || check(typeof self === 'object' && self) ||
// @ts-ignore -- global does not exist
check(typeof global$1 === 'object' && global$1);

/**
  Stores the provided context as the "global testing context".

  Generally setup automatically by `setupContext`.

  @public
  @param {Object} context the context to use
*/
function setContext(context) {
  globalObject.__test_context__ = context;
}

/**
  Retrieve the "global testing context" as stored by `setContext`.

  @public
  @returns {Object} the previously stored testing context
*/
function getContext() {
  return globalObject.__test_context__;
}

/**
  Clear the "global testing context".

  Generally invoked from `teardownContext`.

  @public
*/
function unsetContext() {
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
function pauseTest() {
  const context = getContext();
  if (!context || !isTestContext(context)) {
    throw new Error('Cannot call `pauseTest` without having first called `setupTest` or `setupRenderingTest`.');
  }
  return context.pauseTest();
}

/**
  Resumes a test previously paused by `await pauseTest()`.

  @public
*/
function resumeTest() {
  const context = getContext();
  if (!context || !isTestContext(context)) {
    throw new Error('Cannot call `resumeTest` without having first called `setupTest` or `setupRenderingTest`.');
  }
  context.resumeTest();
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
function getDeprecations() {
  const context = getContext();
  if (!context) {
    throw new Error('[@ember/test-helpers] could not get deprecations if no test context is currently active');
  }
  return getDeprecationsForContext(context);
}
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
function getDeprecationsDuringCallback(callback) {
  const context = getContext();
  if (!context) {
    throw new Error('[@ember/test-helpers] could not get deprecations if no test context is currently active');
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
function getWarnings() {
  const context = getContext();
  if (!context) {
    throw new Error('[@ember/test-helpers] could not get warnings if no test context is currently active');
  }
  return getWarningsForContext(context);
}
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
function getWarningsDuringCallback(callback) {
  const context = getContext();
  if (!context) {
    throw new Error('[@ember/test-helpers] could not get warnings if no test context is currently active');
  }
  return getWarningsDuringCallbackForContext(context, callback);
}

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
function setupContext(base, options = {}) {
  const context = base;

  // SAFETY: this is intimate API *designed* for us to override.
  setTesting(true);
  setContext(context);
  const testMetadata = getTestMetadata(context);
  testMetadata.setupTypes.push('setupContext');
  _backburner.DEBUG = true;
  _prepareOnerror(context);
  return Promise.resolve().then(() => {
    const application = getApplication();
    if (application) {
      return application.boot().then(() => {});
    }
    return;
  }).then(() => {
    const {
      resolver
    } = options;

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
  }).then(owner => {
    Object.defineProperty(context, 'owner', {
      configurable: true,
      enumerable: true,
      value: owner,
      writable: false
    });
    setOwner(context, owner);
    Object.defineProperty(context, 'set', {
      configurable: true,
      enumerable: true,
      // SAFETY: in all of these `defineProperty` calls, we can't actually guarantee any safety w.r.t. the corresponding field's type in `TestContext`
      value(key, value) {
        const ret = run(function () {
          return set(context, key, value);
        });
        return ret;
      },
      writable: false
    });
    Object.defineProperty(context, 'setProperties', {
      configurable: true,
      enumerable: true,
      // SAFETY: in all of these `defineProperty` calls, we can't actually guarantee any safety w.r.t. the corresponding field's type in `TestContext`
      value(hash) {
        const ret = run(function () {
          return setProperties(context, hash);
        });
        return ret;
      },
      writable: false
    });
    Object.defineProperty(context, 'get', {
      configurable: true,
      enumerable: true,
      value(key) {
        return get(context, key);
      },
      writable: false
    });
    Object.defineProperty(context, 'getProperties', {
      configurable: true,
      enumerable: true,
      // SAFETY: in all of these `defineProperty` calls, we can't actually guarantee any safety w.r.t. the corresponding field's type in `TestContext`
      value(...args) {
        return getProperties(context, args);
      },
      writable: false
    });
    let resume;
    context['resumeTest'] = function resumeTest() {
      assert('Testing has not been paused. There is nothing to resume.', !!resume);
      resume();
      global$1.resumeTest = resume = undefined;
    };
    context['pauseTest'] = function pauseTest() {
      console.info('Testing paused. Use `resumeTest()` to continue.'); // eslint-disable-line no-console

      return new Promise(resolve => {
        resume = resolve;
        global$1.resumeTest = resumeTest;
      });
    };
    _setupAJAXHooks();
    return context;
  });
}

export { pauseTest as A, resetOnerror as B, resumeTest as C, setApplication as D, setContext as E, setResolver as F, setupApplicationContext as G, setupContext as H, setupOnerror as I, visit as J, _setupAJAXHooks as K, _cleanupOnerror as _, _teardownAJAXHooks as a, isElement as b, isDocument as c, isWindow as d, registerHook as e, isFormControl as f, getContext as g, isContentEditable as h, isTestContext as i, isVisible as j, isDisabled as k, isNumeric as l, currentRouteName as m, currentURL as n, getApplication as o, getDeprecations as p, getDeprecationsDuringCallback as q, runHooks as r, settled as s, getResolver as t, unsetContext as u, getSettledState as v, waitUntil as w, getWarnings as x, getWarningsDuringCallback as y, isSettled as z };
//# sourceMappingURL=setup-context-BwSdAogx.js.map
