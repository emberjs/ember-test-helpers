import getElement from './-get-element';
import fireEvent from './fire-event';
import settled from '../settled';
import isFocusable from './-is-focusable';

// Use Symbol here #someday...
const FOCUS_SUCCESSFUL = Object.freeze({});
const FOCUS_UNSUCCESSFUL = Object.freeze({});

export function _focus(element) {
  if (isFocusable(element)) {
    let browserIsNotFocused = document.hasFocus && !document.hasFocus();

    // makes `document.activeElement` be `element`. If the browser is focused, it also fires a focus event
    element.focus();

    // Firefox does not trigger the `focusin` event if the window
    // does not have focus. If the document does not have focus then
    // fire `focusin` event as well.
    if (browserIsNotFocused) {
      // if the browser is not focused the previous `el.focus()` didn't fire an event, so we simulate it
      fireEvent(element, 'focus', {
        bubbles: false,
      });

      fireEvent(element, 'focusin');
    }

    return FOCUS_SUCCESSFUL;
  }

  return FOCUS_UNSUCCESSFUL;
}

/**
  @method focus
  @param {String|HTMLElement} selector
  @return {Promise<void>}
  @public
*/
export default function focus(selectorOrElement) {
  if (!selectorOrElement) {
    throw new Error('Must pass an element or selector to `focus`.');
  }

  let element = getElement(selectorOrElement);
  let focusResult = _focus(element);

  if (focusResult !== FOCUS_SUCCESSFUL) {
    throw new Error(`${selectorOrElement} is not focusable`);
  }

  return settled();
}
