import getRootElement from './get-root-element';

/**
  Used internally by the DOM interaction helpers to find multiple elements.

  @private
  @param {string} target the selector to retrieve
  @param {Element} [ancestor] optional root element
  @returns {NodeList} the matched elements
*/
export default function getElements(target, ancestor) {
  if (typeof target === 'string') {
    let rootElement = ancestor;

    if (!(ancestor instanceof HTMLElement)) {
      rootElement = getRootElement();
    }

    return rootElement.querySelectorAll(target);
  } else {
    throw new Error('Must use a selector string');
  }
}
