import { isWindow, isDocument } from './-target.js';

const FORM_CONTROL_TAGS = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'];
/**
  @private
  @param {Element} element the element to check
  @returns {boolean} `true` when the element is a form control, `false` otherwise
*/
function isFormControl(element) {
  return !isWindow(element) && !isDocument(element) && FORM_CONTROL_TAGS.indexOf(element.tagName) > -1 && element.type !== 'hidden';
}

export { isFormControl as default };
//# sourceMappingURL=-is-form-control.js.map
