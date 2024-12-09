import waitUntil from '../wait-until.js';
import getElement from './-get-element.js';
import getElements from './-get-elements.js';
import { lookupDescriptorData } from 'dom-element-descriptors';
import getDescription from './-get-description.js';

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
function waitFor(target, options = {}) {
  return Promise.resolve().then(() => {
    if (typeof target !== 'string' && !lookupDescriptorData(target)) {
      throw new Error('Must pass a selector or DOM element descriptor to `waitFor`.');
    }
    const {
      timeout = 1000,
      count = null
    } = options;
    let {
      timeoutMessage
    } = options;
    if (!timeoutMessage) {
      const description = getDescription(target);
      timeoutMessage = `waitFor timed out waiting for selector "${description}"`;
    }
    let callback;
    if (count !== null) {
      callback = () => {
        const elements = Array.from(getElements(target));
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

export { waitFor as default };
//# sourceMappingURL=wait-for.js.map
