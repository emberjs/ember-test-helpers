export type FormControl = HTMLInputElement | HTMLButtonElement | HTMLSelectElement | HTMLTextAreaElement;
/**
  @private
  @param {Element} element the element to check
  @returns {boolean} `true` when the element is a form control, `false` otherwise
*/
export default function isFormControl(element: Element | Document | Window): element is FormControl;
//# sourceMappingURL=-is-form-control.d.ts.map