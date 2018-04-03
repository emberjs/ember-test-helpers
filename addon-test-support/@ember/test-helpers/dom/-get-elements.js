import getContextElement from './get-context-element';

/**
  Used internally by the DOM interaction helpers to find multiple elements.

  @private
  @param {string} target the selector to retrieve
  @param {string|Element} [context] the context element or selector
  @returns {NodeList} the matched elements
*/
export default function getElements(target, context) {
  if (typeof target === 'string') {
    let rootElement = getContextElement(context);

    return rootElement.querySelectorAll(target);
  } else {
    throw new Error('Must use a selector string');
  }
}
