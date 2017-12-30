import RSVP from 'rsvp';
import { run } from '@ember/runloop';

let originalAsync;

/**
  Configures `RSVP` to resolve promises on the run-loop's action queue. This is
  done by Ember internally since Ember 1.7 and it is only needed to
  provide a consistent testing experience for users of Ember < 1.7.

  @private
*/
export function _setupPromiseListeners() {
  originalAsync = RSVP.configure('async');

  RSVP.configure('async', function(callback, promise) {
    run.backburner.schedule('actions', () => {
      callback(promise);
    });
  });
}

/**
  Resets `RSVP`'s `async` to its prior value.

  @private
*/
export function _teardownPromiseListeners() {
  RSVP.configure('async', originalAsync);
}
