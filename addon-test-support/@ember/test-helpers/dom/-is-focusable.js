import isFormControl from './-is-form-control';
import isContentEditable from './-is-content-editable';

const FOCUSABLE_TAGS = ['LINK', 'A'];
export default function isFocusable(element) {
  if (
    isFormControl(element) ||
    isContentEditable(element) ||
    FOCUSABLE_TAGS.indexOf(element.tagName) > -1
  ) {
    return true;
  }

  return element.hasAttribute('tabindex');
}
