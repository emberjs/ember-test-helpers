import waitUntil from '../wait-until';
import getRootElement from './get-root-element';
import getElement from './-get-element';
import { nextTickPromise } from '../-utils';

/**
  @private
  @param {NodeList} nodelist the nodelist to convert to an array
  @returns {Array} an array
*/
function toArray(nodelist) {
  let array = new Array(nodelist.length);
  for (let i = 0; i < nodelist.length; i++) {
    array[i] = nodelist[i];
  }

  return array;
}

/**
  Used to wait for a particular selector to appear in the DOM. Due to the fact
  that it does not wait for general settledness, this is quite useful for testing
  interim DOM states (e.g. loading states, pending promises, etc).

  @param {string} selector the selector to wait for
  @param {Object} [options] the options to be used
  @param {number} [options.timeout=1000] the time to wait (in ms) for a match
  @param {number} [options.count=1] the number of elements that should match the provided selector
  @returns {Element|Array<Element>} the element (or array of elements) that were being waited upon
*/
export default function waitFor(selector, { timeout = 1000, count = null } = {}) {
  return nextTickPromise().then(() => {
    if (!selector) {
      throw new Error('Must pass a selector to `waitFor`.');
    }

    let callback;
    if (count !== null) {
      callback = () => {
        let rootElement = getRootElement();
        let elements = rootElement.querySelectorAll(selector);
        if (elements.length === count) {
          return toArray(elements);
        }
      };
    } else {
      callback = () => getElement(selector);
    }
    return waitUntil(callback, { timeout });
  });
}
