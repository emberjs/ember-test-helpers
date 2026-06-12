import getElement from './-get-element.js';

// Derived from `querySelector` types.

/**
  Find the first element matched by the given selector. Equivalent to calling
  `querySelector()` on the test root element.

  @public
  @param {string} selector the selector to search for
  @return {Element | null} matched element or null

  @example
  <caption>
    Finding the first element with id 'foo'
  </caption>
  find('#foo');
*/
function find(selector) {
  if (!selector) {
    throw new Error('Must pass a selector to `find`.');
  }
  if (arguments.length > 1) {
    throw new Error('The `find` test helper only takes a single argument.');
  }
  return getElement(selector);
}

export { find as default };
//# sourceMappingURL=find.js.map
