import getElements from './-get-elements';
import toArray from './-to-array';

/**
  Find all elements matched by the given selector. Equivalent to calling
  `querySelectorAll()` on the test root element.

  @public
  @param {string} selector the selector to search for
  @param {string|Element} [context] the context element or selector
  @return {Array} array of matched elements
*/
export default function find(selector, context) {
  if (!selector) {
    throw new Error('Must pass a selector to `findAll`.');
  }

  return toArray(getElements(selector, context));
}
