import getElement from './-get-element';
import fireEvent from './fire-event';
import settled from '../settled';
import { nextTickPromise } from '../-utils';

/**
 * Triggers an event on the specified target.
 *
 * @public
 * @param {string|Element} target the element or selector to trigger the event on
 * @param {string} eventType the type of event to trigger
 * @param {Object} options additional properties to be set on the event
 * @return {Promise<void>} resolves when the application is settled
 *
 * @example
 * <caption>Using triggerEvent to Upload a file
 * When using triggerEvent to upload a file the `eventType` must be `change` and  you must pass an
 * array of [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) as `options`.</caption>
 *
 * triggerEvent(
 *   'input.fileUpload',
 *   'change',
 *   [new Blob(['Ember Rules!'])]
 * );
 */
export default function triggerEvent(target, eventType, options) {
  return nextTickPromise().then(() => {
    if (!target) {
      throw new Error('Must pass an element or selector to `triggerEvent`.');
    }

    let element = getElement(target);
    if (!element) {
      throw new Error(`Element not found when calling \`triggerEvent('${target}', ...)\`.`);
    }

    if (!eventType) {
      throw new Error(`Must provide an \`eventType\` to \`triggerEvent\``);
    }

    fireEvent(element, eventType, options);

    return settled();
  });
}
