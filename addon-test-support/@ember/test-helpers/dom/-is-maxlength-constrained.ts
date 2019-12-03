/**
  @private
  @param {Element} element the element to check
  @returns {boolean} `true` when the element should constrain input by the maxlength attribute, `false` otherwise
*/
export default function isMaxLengthConstrained(element: Element) {
  // ref: https://html.spec.whatwg.org/multipage/input.html#concept-input-apply
  const constrainedInputTypes = ['text', 'search', 'url', 'tel', 'email', 'password'];
  return (
    element.hasAttribute('maxlength') &&
    (element.tagName === 'TEXTAREA' ||
      (element.tagName === 'INPUT' &&
        constrainedInputTypes.indexOf((element as HTMLInputElement).type) > -1))
  );
}
