import waitUntil from '../wait-until';
import { getContext } from '../setup-context';
import getElement from './-get-element';

/**
  @method waitFor
  @param {string|Element} target
  @param {Object} [options]
  @param {number} [options.timeout=1000]
  @param {number} [options.count=1]
*/
export default function waitFor(selector, { timeout = 1000, count = null } = {}) {
  let callback;
  if (count !== null) {
    callback = () => {
      let context = getContext();
      let rootElement = context && context.element;
      let elements = rootElement.querySelectorAll(selector);
      if (elements.length === count) {
        return elements;
      }
    };
  } else {
    callback = () => getElement(selector);
  }
  return waitUntil(callback, { timeout });
}
