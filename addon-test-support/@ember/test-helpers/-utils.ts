/* globals Promise */

const HAS_PROMISE = typeof Promise === 'function';

import RSVP from 'rsvp';
import { run } from '@ember/runloop';

const _Promise: typeof Promise = HAS_PROMISE
  ? Promise
  : (() => {
      // FIXME: this needs to work on IE11
      throw new Error('Missing global Promise!');
    })();

export { _Promise as Promise };

export const nextTick = HAS_PROMISE ? (cb: () => void) => Promise.resolve().then(cb) : RSVP.asap;
export const futureTick = setTimeout;

/**
 Retrieves an array of destroyables from the specified property on the object
 provided, iterates that array invoking each function, then deleting the
 property (clearing the array).

 @private
 @param {Object} object an object to search for the destroyable array within
 @param {string} property the property on the object that contains the destroyable array
*/
export function runDestroyablesFor(object: any, property: string): void {
  let destroyables = object[property];

  if (!destroyables) {
    return;
  }

  for (let i = 0; i < destroyables.length; i++) {
    destroyables[i]();
  }

  delete object[property];
}

/**
 Returns whether the passed in string consists only of numeric characters.

 @private
 @param {string} n input string
 @returns {boolean} whether the input string consists only of numeric characters
 */
export function isNumeric(n: string): boolean {
  return !isNaN(parseFloat(n)) && isFinite(Number(n));
}
