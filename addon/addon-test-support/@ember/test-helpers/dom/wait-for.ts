import waitUntil from '../wait-until';
import getElement from './-get-element';
import getElements from './-get-elements';

export interface Options {
  timeout?: number;
  count?: number | null;
  timeoutMessage?: string;
}

/**
  Used to wait for a particular selector to appear in the DOM. Due to the fact
  that it does not wait for general settledness, this is quite useful for testing
  interim DOM states (e.g. loading states, pending promises, etc).

  @param {string} selector the selector to wait for
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
export default function waitFor(
  selector: string,
  options: Options = {}
): Promise<Element | Element[]> {
  return Promise.resolve().then(() => {
    if (!selector) {
      throw new Error('Must pass a selector to `waitFor`.');
    }

    let { timeout = 1000, count = null, timeoutMessage } = options;
    if (!timeoutMessage) {
      timeoutMessage = `waitFor timed out waiting for selector "${selector}"`;
    }

    let callback: () => Element | Element[] | void | null;
    if (count !== null) {
      callback = () => {
        let elements = getElements(selector);
        if (elements.length === count) {
          return Array.from(elements);
        }
        return;
      };
    } else {
      callback = () => getElement(selector);
    }
    return waitUntil(callback, { timeout, timeoutMessage });
  });
}
