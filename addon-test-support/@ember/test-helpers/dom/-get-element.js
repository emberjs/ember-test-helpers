import { getContext } from '../setup-context';

/**
  Used internally by the DOM interaction helpers to find the element to trigger
  an event on.

  @private
  @method getElement
  @param {string|Element} target the element or selector to retrieve
  @returns {Element} the target or selector
*/
export default function getElement(target) {
  if (target instanceof Window || target instanceof Document || target instanceof Element) {
    return target;
  } else if (typeof target === 'string') {
    let context = getContext();
    let rootElement = context && context.element;
    if (!rootElement) {
      throw new Error(`Must setup rendering context before attempting to interact with elements.`);
    }

    return rootElement.querySelector(target);
  } else {
    throw new Error('Must use an element or a selector string');
  }
}
