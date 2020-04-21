import getRootElement from './get-root-element';
import Target, { isElement } from './-target';

function getElement(target: string): Element | null;
function getElement(target: Element): Element;
function getElement(target: Target): Element | null;
/**
  Used internally by the DOM interaction helpers to find one element.

  @private
  @param {string|Element} target the element or selector to retrieve
  @returns {Element} the target or selector
*/
function getElement(target: Target): Element | null {
  if (typeof target === 'string') {
    let rootElement = getRootElement();

    return rootElement.querySelector(target);
  } else if (isElement(target)) {
    return target;
  } else {
    throw new Error('Must use an element or a selector string');
  }
}

export default getElement;
