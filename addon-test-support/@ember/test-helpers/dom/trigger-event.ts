import getElement from './-get-element';
import fireEvent from './fire-event';
import settled from '../settled';
import { nextTickPromise } from '../-utils';
import Target from './-target';
import { log } from '@ember/test-helpers/dom/-logging';
import isFormControl from './-is-form-control';
import { runHooks, registerHook } from '../-internal/helper-hooks';

registerHook('triggerEvent', 'start', (target: Target, eventType: string) => {
  log('triggerEvent', target, eventType);
});

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
 * <caption>
 * Using `triggerEvent` to upload a file
 *
 * When using `triggerEvent` to upload a file the `eventType` must be `change` and you must pass the
 * `options` param as an object with a key `files` containing an array of
 * [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob).
 * </caption>
 *
 * triggerEvent(
 *   'input.fileUpload',
 *   'change',
 *   { files: [new Blob(['Ember Rules!'])] }
 * );
 *
 *
 * @example
 * <caption>
 * Using `triggerEvent` to upload a dropped file
 *
 * When using `triggerEvent` to handle a dropped (via drag-and-drop) file, the `eventType` must be `drop`. Assuming your `drop` event handler uses the [DataTransfer API](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer),
 * you must pass the `options` param as an object with a key of `dataTransfer`. The `options.dataTransfer`     object should have a `files` key, containing an array of [File](https://developer.mozilla.org/en-US/docs/Web/API/File).
 * </caption>
 *
 * triggerEvent(
 *   '[data-test-drop-zone]',
 *   'drop',
 *   {
 *     dataTransfer: {
 *       files: [new File(['Ember Rules!'], 'ember-rules.txt')]
 *     }
 *   }
 * )
 */
export default function triggerEvent(
  target: Target,
  eventType: string,
  options?: object
): Promise<void> {
  return nextTickPromise()
    .then(() => {
      return runHooks('triggerEvent', 'start', target, eventType, options);
    })
    .then(() => {
      if (!target) {
        throw new Error('Must pass an element or selector to `triggerEvent`.');
      }

      if (!eventType) {
        throw new Error(`Must provide an \`eventType\` to \`triggerEvent\``);
      }

      let element = getElement(target);
      if (!element) {
        throw new Error(`Element not found when calling \`triggerEvent('${target}', ...)\`.`);
      }

      if (isFormControl(element) && element.disabled) {
        throw new Error(`Can not \`triggerEvent\` on disabled ${element}`);
      }

      fireEvent(element, eventType, options);

      return settled();
    })
    .then(() => {
      return runHooks('triggerEvent', 'end', target, eventType, options);
    });
}
