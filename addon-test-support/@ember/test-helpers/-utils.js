import { Promise } from 'rsvp';

export const nextTick = setTimeout;
export const futureTick = setTimeout;

/**
 @private
 @returns {Promise<void>} promise which resolves on the next turn of the event loop
*/
export function nextTickPromise() {
  return new Promise(resolve => {
    nextTick(resolve);
  });
}

/**
 Retrieves an array of destroyables from the specified property on the object
 provided, iterates that array invoking each function, then deleting the
 property (clearing the array).

 @private
 @param {Object} object an object to search for the destroyable array within
 @param {string} property the property on the object that contains the destroyable array
*/
export function runDestroyablesFor(object, property) {
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
export function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
