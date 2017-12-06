import getElement from './-get-element';
import fireEvent from './fire-event';
import focus from './focus';
import settled from '../settled';

/*
  @method click
  @param {String|HTMLElement} selector
  @return {RSVP.Promise}
  @public
*/
export default function click(selector) {
  let element = getElement(selector);

  fireEvent(element, 'mousedown');
  focus(element);
  fireEvent(element, 'mouseup');
  fireEvent(element, 'click');

  return settled();
}
