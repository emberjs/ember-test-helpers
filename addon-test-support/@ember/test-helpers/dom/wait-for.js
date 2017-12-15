import waitUntil from '../wait-until';
import { getContext } from '../setup-context';
import getElement from './-get-element';
import { nextTickPromise } from '../-utils';

function toArray(nodelist) {
  let array = new Array(nodelist.length);
  for (let i = 0; i < nodelist.length; i++) {
    array[i] = nodelist[i];
  }

  return array;
}

/**
  @method waitFor
  @param {string|Element} target
  @param {Object} [options]
  @param {number} [options.timeout=1000]
  @param {number} [options.count=1]
  @returns {Element|Array<Element>}
*/
export default function waitFor(target, { timeout = 1000, count = null } = {}) {
  return nextTickPromise().then(() => {
    if (!target) {
      throw new Error('Must pass an element or selector to `waitFor`.');
    }

    let callback;
    if (count !== null) {
      callback = () => {
        let context = getContext();
        let rootElement = context && context.element;
        let elements = rootElement.querySelectorAll(target);
        if (elements.length === count) {
          return toArray(elements);
        }
      };
    } else {
      callback = () => getElement(target);
    }
    return waitUntil(callback, { timeout });
  });
}
