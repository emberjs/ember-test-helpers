import waitUntil from '../wait-until.js';
import getElement from './-get-element.js';
import { lookupDescriptorData } from 'dom-element-descriptors';
import getDescription from './-get-description.js';

/**
  Used to wait for a particular selector to receive focus. Useful for verifying
  keyboard navigation handling and default focus behaviour, without having to
  think about timing issues.

  @param {string|IDOMElementDescriptor} target the selector or DOM element descriptor to wait receiving focus
  @param {Object} [options] the options to be used
  @param {number} [options.timeout=1000] the time to wait (in ms) for a match
  @param {string} [options.timeoutMessage='waitForFocus timed out waiting for selector'] the message to use in the reject on timeout
  @return {Promise<Element>} resolves when the element received focus

  @example
  <caption>
    Waiting until a selector receive focus:
  </caption>
  await waitForFocus('.my-selector', { timeout: 2000 })
*/
function waitForFocus(target, options = {}) {
  return Promise.resolve().then(() => {
    if (typeof target !== 'string' && !lookupDescriptorData(target)) {
      throw new Error('Must pass a selector or DOM element descriptor to `waitFor`.');
    }
    const {
      timeout = 1000
    } = options;
    let {
      timeoutMessage
    } = options;
    if (!timeoutMessage) {
      const description = getDescription(target);
      timeoutMessage = `waitForFocus timed out waiting for selector "${description}"`;
    }
    return waitUntil(() => {
      const element = getElement(target);
      if (element && element === document.activeElement) {
        return document.activeElement;
      }
    }, {
      timeout,
      timeoutMessage
    });
  });
}

export { waitForFocus as default };
//# sourceMappingURL=wait-for-focus.js.map
