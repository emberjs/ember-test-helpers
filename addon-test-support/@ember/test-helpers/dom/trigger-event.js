import getElement from './-get-element';
import fireEvent from './fire-event';
import settled from '../settled';
import { nextTickPromise } from '../-utils';

/**
  @method triggerEvent
  @param {String|Element} target
  @param {String} eventType
  @param {Object} options
  @return {Promise<void>}
  @public
*/
export default function triggerEvent(target, type, options) {
  return nextTickPromise().then(() => {
    if (!target) {
      throw new Error('Must pass an element or selector to `triggerEvent`.');
    }

    let element = getElement(target);
    if (!element) {
      throw new Error(`Element not found when calling \`triggerEvent('${target}', ...)\`.`);
    }

    if (!type) {
      throw new Error(`Must provide an \`eventType\` to \`triggerEvent\``);
    }

    fireEvent(element, type, options);

    return settled();
  });
}
