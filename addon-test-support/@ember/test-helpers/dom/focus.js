import getElement from './-get-element';
import fireEvent from './fire-event';
import settled from '../settled';
import isFocusable from './-is-focusable';
import { nextTickPromise } from '../-utils';

/**
  @private
  @method __focus__
  @param {Element} element
*/
export function __focus__(element) {
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
}

/**
  @method focus
  @param {String|Element} target
  @return {Promise<void>}
  @public
*/
export default function focus(target) {
  return nextTickPromise().then(() => {
    if (!target) {
      throw new Error('Must pass an element or selector to `focus`.');
    }

    let element = getElement(target);
    if (!element) {
      throw new Error(`Element not found when calling \`focus('${target}')\`.`);
    }

    if (!isFocusable(element)) {
      throw new Error(`${target} is not focusable`);
    }

    __focus__(element);

    return settled();
  });
}
