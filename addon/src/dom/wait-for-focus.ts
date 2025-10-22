import waitUntil from '../wait-until.ts';
import getElement from './-get-element.ts';
import {
  type IDOMElementDescriptor,
  lookupDescriptorData,
} from 'dom-element-descriptors';
import getDescription from './-get-description.ts';

export interface Options {
  timeout?: number;
  count?: number | null;
  timeoutMessage?: string;
}

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
export default function waitForFocus(
  target: string | IDOMElementDescriptor,
  options: Options = {},
): Promise<Element> {
  return Promise.resolve().then(() => {
    if (typeof target !== 'string' && !lookupDescriptorData(target)) {
      throw new Error(
        'Must pass a selector or DOM element descriptor to `waitFor`.',
      );
    }

    const { timeout = 1000 } = options;
    let { timeoutMessage } = options;

    if (!timeoutMessage) {
      const description = getDescription(target);
      timeoutMessage = `waitForFocus timed out waiting for selector "${description}"`;
    }

    return waitUntil(
      () => {
        const element = getElement(target);
        if (element && element === document.activeElement) {
          return document.activeElement as HTMLElement;
        }
      },
      { timeout, timeoutMessage },
    );
  });
}
