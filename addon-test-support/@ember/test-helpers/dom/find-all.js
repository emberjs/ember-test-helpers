import getElements from './-get-elements';
import toArray from './-to-array';

/**
  Find all elements matched by the given selector. Equivalent to calling
  `querySelectorAll()` on the test root element.

  @public
  @param {string} selector the selector to search for
  @param {Element} ancestor optional root element
  @return {Array} array of matched elements
*/
export default function find(selector, ancestor) {
  if (!selector) {
    throw new Error('Must pass a selector to `findAll`.');
  }

  return toArray(getElements(selector, ancestor));
}
