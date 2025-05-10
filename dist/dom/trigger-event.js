import { getWindowOrElement } from './-get-window-or-element.js';
import fireEvent from './fire-event.js';
import { s as settled } from '../setup-context-BSrEM03X.js';
import { log } from './-logging.js';
import isFormControl from './-is-form-control.js';
import { registerHook, runHooks } from '../helper-hooks.js';
import getDescription from './-get-description.js';

registerHook('triggerEvent', 'start', (target, eventType) => {
  log('triggerEvent', target, eventType);
});

/**
 * Triggers an event on the specified target.
 *
 * @public
 * @param {string|Element|IDOMElementDescriptor} target the element, selector, or descriptor to trigger the event on
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
function triggerEvent(target, eventType, options) {
  return Promise.resolve().then(() => {
    return runHooks('triggerEvent', 'start', target, eventType, options);
  }).then(() => {
    if (!target) {
      throw new Error('Must pass an element, selector, or descriptor to `triggerEvent`.');
    }
    if (!eventType) {
      throw new Error(`Must provide an \`eventType\` to \`triggerEvent\``);
    }
    const element = getWindowOrElement(target);
    if (!element) {
      const description = getDescription(target);
      throw new Error(`Element not found when calling \`triggerEvent('${description}', ...)\`.`);
    }
    if (isFormControl(element) && element.disabled) {
      throw new Error(`Can not \`triggerEvent\` on disabled ${element}`);
    }
    return fireEvent(element, eventType, options).then(settled);
  }).then(() => {
    return runHooks('triggerEvent', 'end', target, eventType, options);
  });
}

export { triggerEvent as default };
//# sourceMappingURL=trigger-event.js.map
