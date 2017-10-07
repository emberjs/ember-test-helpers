import RSVP from 'rsvp';
import { run } from '@ember/runloop';

let originalAsync;
export function _setupPromiseListeners() {
  originalAsync = RSVP.configure('async');

  RSVP.configure('async', function(callback, promise) {
    run.backburner.schedule('actions', () => {
      callback(promise);
    });
  });
}

export function _teardownPromiseListeners() {
  RSVP.configure('async', originalAsync);
}
