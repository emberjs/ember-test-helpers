import { Promise } from 'rsvp';

import { nextTick } from './-utils';

export default function(callback, options = {}) {
  let timeout = 'timeout' in options ? options.timeout : 1000;

  // creating this error eagerly so it has the proper invocation stack
  let waitUntilTimedOut = new Error('waitUntil timed out');

  return new Promise(function(resolve, reject) {
    // starting at -10 because the first invocation happens on 0
    // but still increments the time...
    let time = -10;
    function tick() {
      time += 10;

      let value;
      try {
        value = callback();
      } catch (error) {
        reject(error);
      }

      if (value) {
        resolve(value);
      } else if (time < timeout) {
        // using `setTimeout` directly to allow fake timers
        // to intercept
        nextTick(tick, 10);
      } else {
        reject(waitUntilTimedOut);
      }
    }

    nextTick(tick);
  });
}
