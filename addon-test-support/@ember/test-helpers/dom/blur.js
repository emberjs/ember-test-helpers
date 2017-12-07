import getElement from './-get-element';
import fireEvent from './fire-event';
import settled from '../settled';
import isFocusable from './-is-focusable';
import { nextTick } from '../-utils';

export function _blur(element) {
  let browserIsNotFocused = document.hasFocus && !document.hasFocus();

  // makes `document.activeElement` be `body`.
  // If the browser is focused, it also fires a blur event
  element.blur();

  // Chrome/Firefox does not trigger the `blur` event if the window
  // does not have focus. If the document does not have focus then
  // fire `blur` event via native event.
  if (browserIsNotFocused) {
    fireEvent(element, 'blur', { bubbles: false });
    fireEvent(element, 'focusout');
  }
}

/**
  @method blur
  @param {String|HTMLElement} selector
  @return {Promise<void>}
  @public
*/
export default function blur(selectorOrElement = document.activeElement) {
  let element = getElement(selectorOrElement);
  if (!element) {
    throw new Error(`Element not found when calling \`blur('${selectorOrElement}')\`.`);
  }

  if (!isFocusable(element)) {
    throw new Error(`${selectorOrElement} is not focusable`);
  }

  nextTick(() => _blur(element));

  return settled();
}
