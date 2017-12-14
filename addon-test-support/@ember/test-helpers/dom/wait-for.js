import waitUntil from '../wait-until';
import { getContext } from '../setup-context';
import getElement from './-get-element';

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
export default function waitFor(selector, { timeout = 1000, count = null } = {}) {
  let callback;
  if (count !== null) {
    callback = () => {
      let context = getContext();
      let rootElement = context && context.element;
      let elements = rootElement.querySelectorAll(selector);
      if (elements.length === count) {
        return toArray(elements);
      }
    };
  } else {
    callback = () => getElement(selector);
  }
  return waitUntil(callback, { timeout });
}
