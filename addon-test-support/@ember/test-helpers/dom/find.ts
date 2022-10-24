import getElement from './-get-element';

/**
  Find the first element matched by the given selector. Equivalent to calling
  `querySelector()` on the test root element.

  @public
  @param {string} selector the selector to search for
  @return {Element} matched element or null

  @example
  <caption>
    Find all of the elements matching '.my-selector'.
  </caption>
  findAll('.my-selector');

*/
export default function find(selector: string): Element | null {
  if (!selector) {
    throw new Error('Must pass a selector to `find`.');
  }

  if (arguments.length > 1) {
    throw new Error('The `find` test helper only takes a single argument.');
  }

  return getElement(selector);
}
