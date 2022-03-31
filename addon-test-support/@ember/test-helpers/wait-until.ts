import { futureTick, Promise } from './-utils';
import setupOnerror, {
  resetOnerror,
  _getContextForOnError,
} from './setup-onerror';

const TIMEOUTS = [0, 1, 2, 5, 7];
const MAX_TIMEOUT = 10;

type Falsy = false | 0 | '' | null | undefined;

export interface Options {
  timeout?: number;
  timeoutMessage?: string;

  /**
   * Instrument `Ember.onerror` and reject, when it is called. This is useful
   * for detecting that an operation inside a run loop has failed.
   *
   * This uses {@link setupOnerror}, so it will override any error listeners you
   * might have set up before.
   *
   * @default true if the test context has been setup for usage with {@link setupOnerror}
   */
  rejectOnError?: boolean;
}

/**
  Wait for the provided callback to return a truthy value.

  This does not leverage `settled()`, and as such can be used to manage async
  while _not_ settled (e.g. "loading" or "pending" states).

  @public
  @param {Function} callback the callback to use for testing when waiting should stop
  @param {Object} [options] options used to override defaults
  @param {number} [options.timeout=1000] the maximum amount of time to wait
  @param {string} [options.timeoutMessage='waitUntil timed out'] the message to use in the reject on timeout
  @param {boolean} [options.rejectOnError] reject when an operation in a run loop has failed; defaults to `true`, if the test context has been setup for usage with {@link setupOnerror}
  @returns {Promise} resolves with the callback value when it returns a truthy value

  @example
  <caption>
    Waiting until a selected element displays text:
  </caption>
  await waitUntil(function() {
    return find('.my-selector').textContent.includes('something')
  }, { timeout: 2000 })
*/
export default function waitUntil<T>(
  callback: () => T | void | Falsy,
  {
    timeout = 1000,
    timeoutMessage = 'waitUntil timed out',
    rejectOnError = Boolean(_getContextForOnError(false)),
  }: Options = {}
): Promise<T> {
  // creating this error eagerly so it has the proper invocation stack
  let waitUntilTimedOut = new Error(timeoutMessage);

  return new Promise(function (resolve, reject) {
    let time = 0;
    let error: unknown = undefined;

    if (rejectOnError) {
      setupOnerror((e) => {
        error = e;
      });
    }

    // eslint-disable-next-line require-jsdoc
    function scheduleCheck(timeoutsIndex: number) {
      let interval = TIMEOUTS[timeoutsIndex];
      if (interval === undefined) {
        interval = MAX_TIMEOUT;
      }

      futureTick(function () {
        time += interval;

        let value: T | void | Falsy;
        try {
          value = callback();
        } catch (error) {
          reject(error);
          return;
        }

        if (typeof error !== 'undefined') {
          resetOnerror();
          reject(error);
          return;
        }

        if (value) {
          if (rejectOnError) resetOnerror();
          resolve(value);
        } else if (time < timeout) {
          scheduleCheck(timeoutsIndex + 1);
        } else {
          if (rejectOnError) resetOnerror();
          reject(waitUntilTimedOut);
        }
      }, interval);
    }

    scheduleCheck(0);
  });
}
