import getElement from './-get-element';
import isWindow from './-is-window';

type Target = string | Element | Document | Window;

export default Target;

export interface HTMLElementContentEditable extends HTMLElement {
  isContentEditable: true;
}

// eslint-disable-next-line require-jsdoc
export function isElement(target: any): target is Element {
  return target.nodeType === Node.ELEMENT_NODE;
}

// eslint-disable-next-line require-jsdoc
export function isDocument(target: any): target is Document {
  return target.nodeType === Node.DOCUMENT_NODE;
}

// eslint-disable-next-line require-jsdoc
export function isContentEditable(element: Element): element is HTMLElementContentEditable {
  return 'isContentEditable' in element && (element as HTMLElement).isContentEditable;
}

/**
  Used internally by the DOM interaction helpers to find either window or an element.

  @private
  @param {string|Element} target the window, an element or selector to retrieve
  @returns {Element|Window} the target or selector
*/
export function getTarget(target: Target): Element | Document | Window | null {
  if (isWindow(target)) {
    return target as Window;
  }

  return getElement(target);
}
