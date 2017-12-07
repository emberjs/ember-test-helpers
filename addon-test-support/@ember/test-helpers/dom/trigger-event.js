import getElement from './-get-element';
import fireEvent from './fire-event';
import settled from '../settled';
import { nextTickPromise } from '../-utils';

/**
  @method triggerEvent
  @param {String|HTMLElement} selector
  @param {String} type
  @param {Object} options
  @return {Promise<void>}
  @public
*/
export default function triggerEvent(selectorOrElement, type, options) {
  let element = getElement(selectorOrElement);

  return nextTickPromise().then(() => {
    fireEvent(element, type, options);

    return settled();
  });
}
