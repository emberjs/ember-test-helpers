import isFormControl from './-is-form-control.js';
import { isWindow, isDocument, isContentEditable } from './-target.js';

// For reference:
// https://html.spec.whatwg.org/multipage/interaction.html#the-tabindex-attribute
const FOCUSABLE_TAGS = ['A', 'SUMMARY'];
// eslint-disable-next-line require-jsdoc
function isFocusableElement(element) {
  return FOCUSABLE_TAGS.indexOf(element.tagName) > -1;
}

/**
  @private
  @param {Element} element the element to check
  @returns {boolean} `true` when the element is focusable, `false` otherwise
*/
function isFocusable(element) {
  if (isWindow(element)) {
    return false;
  }
  if (isDocument(element)) {
    return false;
  }
  if (isFormControl(element)) {
    return !element.disabled;
  }
  if (isContentEditable(element) || isFocusableElement(element)) {
    return true;
  }
  return element.hasAttribute('tabindex');
}

export { isFocusable as default };
//# sourceMappingURL=-is-focusable.js.map
