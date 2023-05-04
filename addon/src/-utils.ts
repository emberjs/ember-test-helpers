/* globals Promise */

import isFormControl from './dom/-is-form-control';

export const nextTick = (cb: () => void) => Promise.resolve().then(cb);
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

/**
  Checks if an element is considered visible by the focus area spec.

  @private
  @param {Element} element the element to check
  @returns {boolean} `true` when the element is visible, `false` otherwise
*/
export function isVisible(element: Element): boolean {
  let styles = window.getComputedStyle(element);
  return styles.display !== 'none' && styles.visibility !== 'hidden';
}

/**
  Checks if an element is disabled.

  @private
  @param {Element} element the element to check
  @returns {boolean} `true` when the element is disabled, `false` otherwise
*/
export function isDisabled(element: HTMLElement): boolean {
  if (isFormControl(element)) {
    return (element as HTMLInputElement).disabled;
  }
  return false;
}
