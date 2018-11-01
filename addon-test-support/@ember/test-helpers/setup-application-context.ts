/* globals EmberENV */
import { get } from '@ember/object';
import { nextTickPromise } from './-utils';
import { getContext } from './setup-context';
import hasEmberVersion from './has-ember-version';
import settled from './settled';

/**
  Navigate the application to the provided URL.

  @public
  @returns {Promise<void>} resolves when settled
*/
export function visit() {
  let context = getContext();
  let { owner } = context;

  return nextTickPromise()
    .then(() => {
      return owner.visit(...arguments);
    })
    .then(() => {
      if (EmberENV._APPLICATION_TEMPLATE_WRAPPER !== false) {
        context.element = document.querySelector('#ember-testing > .ember-view');
      } else {
        context.element = document.querySelector('#ember-testing');
      }
    })
    .then(settled);
}

/**
  @public
  @returns {string} the currently active route name
*/
export function currentRouteName() {
  let { owner } = getContext();
  let router = owner.lookup('router:main');
  return get(router, 'currentRouteName');
}

const HAS_CURRENT_URL_ON_ROUTER = hasEmberVersion(2, 13);

/**
  @public
  @returns {string} the applications current url
*/
export function currentURL() {
  let { owner } = getContext();
  let router = owner.lookup('router:main');

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
export default function setupApplicationContext() {
  return nextTickPromise();
}
