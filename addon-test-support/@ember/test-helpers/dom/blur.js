import getElement from './-get-element';
import fireEvent from './fire-event';
import settled from '../settled';
import isFocusable from './-is-focusable';

/*
  @method blur
  @param {String|HTMLElement} selector
  @return {RSVP.Promise}
  @public
*/
export default function blur(selectorOrElement) {
  if (!selectorOrElement) {
    throw new Error('Must pass an element or selector to `blur`.');
  }

  let element = getElement(selectorOrElement);

  if (isFocusable(element)) {
    let browserIsNotFocused = document.hasFocus && !document.hasFocus();

    fireEvent(element, 'focusout');

    // makes `document.activeElement` be `body`.
    // If the browser is focused, it also fires a blur event
    element.blur();

    // Chrome/Firefox does not trigger the `blur` event if the window
    // does not have focus. If the document does not have focus then
    // fire `blur` event via native event.
    if (browserIsNotFocused) {
      fireEvent(element, 'blur', { bubbles: false });
    }
  }

  return settled();
}
