import getElement from './-get-element';
import fireEvent from './fire-event';
import settled from '../settled';

const FOCUSABLE_TAGS = ['INPUT', 'BUTTON', 'LINK', 'SELECT', 'A', 'TEXTAREA'];
function isFocusable(el) {
  let { tagName, type } = el;

  if (type === 'hidden') {
    return false;
  }

  if (FOCUSABLE_TAGS.indexOf(tagName) > -1 || el.contentEditable === 'true') {
    return true;
  }

  return el.hasAttribute('tabindex');
}

/*
  @method focus
  @param {String|HTMLElement} selector
  @return {RSVP.Promise}
  @public
*/
export default function focus(selectorOrElement) {
  if (!selectorOrElement) {
    throw new Error('Must pass an element or selector to `focus`.');
  }

  let element = getElement(selectorOrElement);

  if (isFocusable(element)) {
    let browserIsNotFocused = document.hasFocus && !document.hasFocus();

    // Firefox does not trigger the `focusin` event if the window
    // does not have focus. If the document does not have focus then
    // fire `focusin` event as well.
    if (browserIsNotFocused) {
      fireEvent(element, 'focusin');
    }

    // makes `document.activeElement` be `el`. If the browser is focused, it also fires a focus event
    element.focus();

    // if the browser is not focused the previous `el.focus()` didn't fire an event, so we simulate it
    if (browserIsNotFocused) {
      fireEvent(element, 'focus', {
        bubbles: false,
      });
    }
  }

  return settled();
}
