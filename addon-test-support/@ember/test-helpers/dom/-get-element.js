import getRootElement from './get-root-element';

/**
  Used internally by the DOM interaction helpers to find one element.

  @private
  @param {string|Element} target the element or selector to retrieve
  @param {Element} [ancestor] optional root element
  @returns {Element} the target or selector
*/
export default function getElement(target, ancestor) {
  if (
    target.nodeType === Node.ELEMENT_NODE ||
    target.nodeType === Node.DOCUMENT_NODE ||
    target instanceof Window
  ) {
    return target;
  } else if (typeof target === 'string') {
    let rootElement = ancestor;

    if (!(ancestor instanceof HTMLElement)) {
      rootElement = getRootElement();
    }

    return rootElement.querySelector(target);
  } else {
    throw new Error('Must use an element or a selector string');
  }
}
