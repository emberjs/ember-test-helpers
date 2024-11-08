import isFormControl from './dom/-is-form-control.js';

/* globals Promise */

const nextTick = cb => Promise.resolve().then(cb);
const futureTick = setTimeout;

/**
 Retrieves an array of destroyables from the specified property on the object
 provided, iterates that array invoking each function, then deleting the
 property (clearing the array).

 @private
 @param {Object} object an object to search for the destroyable array within
 @param {string} property the property on the object that contains the destroyable array
*/
function runDestroyablesFor(object, property) {
  const destroyables = object[property];
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
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(Number(n));
}

/**
  Checks if an element is considered visible by the focus area spec.

  @private
  @param {Element} element the element to check
  @returns {boolean} `true` when the element is visible, `false` otherwise
*/
function isVisible(element) {
  const styles = window.getComputedStyle(element);
  return styles.display !== 'none' && styles.visibility !== 'hidden';
}

/**
  Checks if an element is disabled.

  @private
  @param {Element} element the element to check
  @returns {boolean} `true` when the element is disabled, `false` otherwise
*/
function isDisabled(element) {
  if (isFormControl(element)) {
    return element.disabled;
  }
  return false;
}

export { futureTick, isDisabled, isNumeric, isVisible, nextTick, runDestroyablesFor };
//# sourceMappingURL=-utils.js.map
