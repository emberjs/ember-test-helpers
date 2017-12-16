import { get } from '@ember/object';
import { nextTickPromise } from './-utils';
import { getContext } from './setup-context';
import hasEmberVersion from './has-ember-version';
import settled from './settled';

export function visit() {
  let context = getContext();
  let { owner } = context;

  return nextTickPromise()
    .then(() => {
      return owner.visit(...arguments);
    })
    .then(() => {
      context.element = document.querySelector('#ember-testing > .ember-view');
    })
    .then(settled);
}

export function currentRouteName() {
  let { owner } = getContext();
  let router = owner.lookup('router:main');
  return get(router, 'currentRouteName');
}

const HAS_CURRENT_URL_ON_ROUTER = hasEmberVersion(2, 13);
export function currentURL() {
  let { owner } = getContext();
  let router = owner.lookup('router:main');

  if (HAS_CURRENT_URL_ON_ROUTER) {
    return get(router, 'currentURL');
  } else {
    return get(router, 'location').getURL();
  }
}

export default function() {
  return nextTickPromise();
}
