import getElement from './-get-element';

/**
  Find the first element matched by the given selector. Equivalent to calling
  `querySelector()` on the test root element.

  @public
  @param {string} selector the selector to search for
  @param {string|Element} [context] the context element or selector
  @return {Element} matched element or null
*/
export default function find(selector, context) {
  if (!selector) {
    throw new Error('Must pass a selector to `find`.');
  }

  return getElement(selector, context);
}
