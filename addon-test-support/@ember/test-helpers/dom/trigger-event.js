import getElement from './-get-element';
import fireEvent from './fire-event';
import settled from '../settled';
import { nextTickPromise } from '../-utils';

/**
  @method triggerEvent
  @param {String|HTMLElement} selector
  @param {String} eventType
  @param {Object} options
  @return {Promise<void>}
  @public
*/
export default function triggerEvent(selectorOrElement, type, options) {
  if (!selectorOrElement) {
    throw new Error('Must pass an element or selector to `triggerEvent`.');
  }

  let element = getElement(selectorOrElement);
  if (!element) {
    throw new Error(
      `Element not found when calling \`triggerEvent('${selectorOrElement}', ...)\`.`
    );
  }

  if (!type) {
    throw new Error(`Must provide an \`eventType\` to \`triggerEvent\``);
  }

  return nextTickPromise().then(() => {
    fireEvent(element, type, options);

    return settled();
  });
}
