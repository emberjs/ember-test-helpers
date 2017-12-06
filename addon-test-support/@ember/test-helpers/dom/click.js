import getElement from './-get-element';
import fireEvent from './fire-event';
import { _focus } from './focus';
import settled from '../settled';
import isFocusable from './-is-focusable';
import { nextTick } from '../-utils';

/**
  @method click
  @param {String|HTMLElement} selector
  @return {Promise<void>}
  @public
*/
export default function click(selector) {
  let element = getElement(selector);
  if (!element) {
    throw new Error(`Element not found when calling \`click('${selector}')\`.`);
  }

  nextTick(() => {
    fireEvent(element, 'mousedown');
    if (isFocusable(element)) {
      _focus(element);
    }
    fireEvent(element, 'mouseup');
    fireEvent(element, 'click');
  });

  return settled();
}
