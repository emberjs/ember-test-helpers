import waitUntil from '../wait-until';
import getElement from './-get-element';
import getElements from './-get-elements';
import { lookupDescriptorData } from 'dom-element-descriptors';
import getDescription from './-get-description';
/**
  Used to wait for a particular selector to appear in the DOM. Due to the fact
  that it does not wait for general settledness, this is quite useful for testing
  interim DOM states (e.g. loading states, pending promises, etc).

  @param {string|IDOMElementDescriptor} target the selector or DOM element descriptor to wait for
  @param {Object} [options] the options to be used
  @param {number} [options.timeout=1000] the time to wait (in ms) for a match
  @param {number} [options.count=null] the number of elements that should match the provided selector (null means one or more)
  @return {Promise<Element|Element[]>} resolves when the element(s) appear on the page

  @example
  <caption>
    Waiting until a selector is rendered:
  </caption>
  await waitFor('.my-selector', { timeout: 2000 })
*/
export default function waitFor(target, options = {}) {
  return Promise.resolve().then(() => {
    if (typeof target !== 'string' && !lookupDescriptorData(target)) {
      throw new Error('Must pass a selector or DOM element descriptor to `waitFor`.');
    }
    let {
      timeout = 1000,
      count = null,
      timeoutMessage
    } = options;
    if (!timeoutMessage) {
      let description = getDescription(target);
      timeoutMessage = `waitFor timed out waiting for selector "${description}"`;
    }
    let callback;
    if (count !== null) {
      callback = () => {
        let elements = Array.from(getElements(target));
        if (elements.length === count) {
          return elements;
        }
        return;
      };
    } else {
      callback = () => getElement(target);
    }
    return waitUntil(callback, {
      timeout,
      timeoutMessage
    });
  });
}