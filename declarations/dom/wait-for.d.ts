import { type IDOMElementDescriptor } from 'dom-element-descriptors';
export interface Options {
    timeout?: number;
    count?: number | null;
    timeoutMessage?: string;
}
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
export default function waitFor(target: string | IDOMElementDescriptor, options?: Options): Promise<Element | Element[]>;
//# sourceMappingURL=wait-for.d.ts.map