import isFormControl from './-is-form-control';

const FOCUSABLE_TAGS = ['A'];
export default function isFocusable(element) {
  if (
    isFormControl(element) ||
    element.isContentEditable ||
    FOCUSABLE_TAGS.indexOf(element.tagName) > -1
  ) {
    return true;
  }

  return element.hasAttribute('tabindex');
}
