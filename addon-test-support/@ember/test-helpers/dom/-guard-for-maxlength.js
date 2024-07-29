// ref: https://html.spec.whatwg.org/multipage/input.html#concept-input-apply
const constrainedInputTypes = ['text', 'search', 'url', 'tel', 'email', 'password'];

/**
  @private
  @param {Element} element - the element to check
  @returns {boolean} `true` when the element should constrain input by the maxlength attribute, `false` otherwise
*/
function isMaxLengthConstrained(element) {
  return !!Number(element.getAttribute('maxlength')) && (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement && constrainedInputTypes.indexOf(element.type) > -1);
}

/**
 * @private
 * @param {Element} element - the element to check
 * @param {string} text - the text being added to element
 * @param {string} testHelper - the test helper context the guard is called from (for Error message)
 * @throws if `element` has `maxlength` & `value` exceeds `maxlength`
 */
export default function guardForMaxlength(element, text, testHelper) {
  const maxlength = element.getAttribute('maxlength');
  if (isMaxLengthConstrained(element) && maxlength && text && text.length > Number(maxlength)) {
    throw new Error(`Can not \`${testHelper}\` with text: '${text}' that exceeds maxlength: '${maxlength}'.`);
  }
}