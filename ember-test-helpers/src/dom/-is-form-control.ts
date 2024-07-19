import { isDocument, isWindow } from './-target';

const FORM_CONTROL_TAGS = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'];

export type FormControl =
  | HTMLInputElement
  | HTMLButtonElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

/**
  @private
  @param {Element} element the element to check
  @returns {boolean} `true` when the element is a form control, `false` otherwise
*/
export default function isFormControl(
  element: Element | Document | Window
): element is FormControl {
  return (
    !isWindow(element) &&
    !isDocument(element) &&
    FORM_CONTROL_TAGS.indexOf(element.tagName) > -1 &&
    (element as HTMLInputElement).type !== 'hidden'
  );
}
