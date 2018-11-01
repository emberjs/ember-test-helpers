import getElements from './-get-elements';
import toArray from './-to-array';

/**
  Find all elements matched by the given selector. Equivalent to calling
  `querySelectorAll()` on the test root element.

  @public
  @param {string} selector the selector to search for
  @return {Array} array of matched elements
*/
export default function find(selector) {
  if (!selector) {
    throw new Error('Must pass a selector to `findAll`.');
  }

  if (arguments.length > 1) {
    throw new Error('The `findAll` test helper only takes a single argument.');
  }

  return toArray(getElements(selector));
}
