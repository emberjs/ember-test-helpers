import isFormControl from './-is-form-control';

const FOCUSABLE_TAGS = ['A'];

/**
  @private
  @param {Element} element the element to check
  @returns {boolean} `true` when the element is focusable, `false` otherwise
*/
export default function isFocusable(element: Element): boolean {
  if (
    isFormControl(element) ||
    (element as HTMLElement).isContentEditable ||
    FOCUSABLE_TAGS.indexOf(element.tagName) > -1
  ) {
    return true;
  }

  return element.hasAttribute('tabindex');
}
