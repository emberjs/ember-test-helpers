import getElement from './-get-element';
import fireEvent from './fire-event';
import { _focus } from './focus';
import settled from '../settled';

/**
  @method click
  @param {String|HTMLElement} selector
  @return {Promise<void>}
  @public
*/
export default function click(selector) {
  let element = getElement(selector);

  fireEvent(element, 'mousedown');
  _focus(element);
  fireEvent(element, 'mouseup');
  fireEvent(element, 'click');

  return settled();
}
