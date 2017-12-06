import { Promise } from 'rsvp';

export default function(callback, options = {}) {
  let timeout = 'timeout' in options ? options.timeout : 1000;
  let waitUntilTimedOut = new Error('waitUntil timed out');

  return new Promise(function(resolve, reject) {
    let time = 0;
    function tick() {
      time += 10;
      let value = callback();
      if (value) {
        resolve(value);
      } else if (time < timeout) {
        setTimeout(tick, 10);
      } else {
        reject(waitUntilTimedOut);
      }
    }
    setTimeout(tick, 10);
  });
}
