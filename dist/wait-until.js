import { futureTick } from './-utils.js';

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

export { waitUntil as default };
//# sourceMappingURL=wait-until.js.map
