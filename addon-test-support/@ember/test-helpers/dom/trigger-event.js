import getElement from './-get-element';
import fireEvent from './fire-event';
import settled from '../settled';

/**
  @method triggerEvent
  @param {String|HTMLElement} selector
  @param {String} type
  @param {Object} options
  @return {RSVP.Promise}
  @public
*/
export default function triggerEvent(selectorOrElement, type, options) {
  let element = getElement(selectorOrElement);
  fireEvent(element, type, options);
  return settled();
}
