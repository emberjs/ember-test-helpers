import { run } from '@ember/runloop';
import { _teardownPromiseListeners } from './ext/rsvp';
import { _teardownAJAXHooks } from './settled';
import { Promise } from 'rsvp';
import Ember from 'ember';

export default function(context) {
  return new Promise(resolve => {
    // ensure "real" async and not "fake" RSVP based async
    setTimeout(() => {
      let { owner } = context;

      _teardownPromiseListeners();
      _teardownAJAXHooks();

      run(owner, 'destroy');
      Ember.testing = false;

      resolve(context);
    }, 0);
  });
}
