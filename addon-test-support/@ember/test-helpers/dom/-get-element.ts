import getRootElement from './get-root-element';
import Target, { isDocument, isElement } from './-target';

/**
  Used internally by the DOM interaction helpers to find one element.

  @private
  @param {string|Element} target the element or selector to retrieve
  @returns {Element} the target or selector
*/
export default function getElement(target: Target) {
  if (typeof target === 'string') {
    let rootElement = getRootElement();

    return rootElement.querySelector(target);
  } else if (isElement(target) || isDocument(target) || (target as any) instanceof Window) {
    return target;
  } else {
    throw new Error('Must use an element or a selector string');
  }
}
