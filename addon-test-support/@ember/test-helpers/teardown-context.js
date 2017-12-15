import { run } from '@ember/runloop';
import { _teardownPromiseListeners } from './ext/rsvp';
import { _teardownAJAXHooks } from './settled';
import { unsetContext } from './setup-context';
import { nextTickPromise } from './-utils';
import settled from './settled';
import Ember from 'ember';

export default function(context) {
  return nextTickPromise().then(() => {
    let { owner } = context;

    _teardownPromiseListeners();
    _teardownAJAXHooks();

    run(owner, 'destroy');
    Ember.testing = false;

    unsetContext();

    return settled();
  });
}
