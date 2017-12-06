import { Promise } from 'rsvp';

import { nextTick } from './-utils';

export default function(callback, options = {}) {
  let timeout = 'timeout' in options ? options.timeout : 1000;
  let waitUntilTimedOut = new Error('waitUntil timed out');

  return new Promise(function(resolve, reject) {
    // starting at -10 because the first invocation happens on 0
    // but still increments the time...
    let time = -10;
    function tick() {
      time += 10;
      let value = callback();
      if (value) {
        resolve(value);
      } else if (time < timeout) {
        // using `setTimeout` directly to allow fake timers
        // to intercept
        setTimeout(tick, 10);
      } else {
        reject(waitUntilTimedOut);
      }
    }

    nextTick(tick);
  });
}
