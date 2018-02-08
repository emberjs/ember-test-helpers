import getElement from './-get-element';

/**
  Find the first element matched by the given selector. Equivalent to calling
  `querySelector()` on the test root element.

  @public
  @param {string} selector the selector to search for
  @param {Element} ancestor optional root element
  @return {Element} matched element or null
*/
export default function find(selector, ancestor) {
  if (!selector) {
    throw new Error('Must pass a selector to `find`.');
  }

  return getElement(selector, ancestor);
}
