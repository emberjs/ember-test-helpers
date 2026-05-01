import { isDocument } from './-target.js';

/**
  @private
  @param {Element} element the element to check
  @returns {boolean} `true` when the element is a select element, `false` otherwise
*/
function isSelectElement(element) {
  return !isDocument(element) && element.tagName === 'SELECT';
}

export { isSelectElement as default };
//# sourceMappingURL=-is-select-element.js.map
