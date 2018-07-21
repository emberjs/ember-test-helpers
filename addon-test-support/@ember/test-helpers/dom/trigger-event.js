import getElement from './-get-element';
import fireEvent from './fire-event';
import settled from '../settled';
import { nextTickPromise } from '../-utils';

/**
 * Triggers an event on the specified target.
 *
 * For HTML `input` element of type 'file', if you wish to trigger `change`
 * event, the options param can be passed as:
 *   1. an array of `File` objects.
 *   2. an object with key `files` which contains an array of `File` objects.
 *
 * @public
 * @param {string|Element} target the element or selector to trigger the event on
 * @param {string} eventType the type of event to trigger
 * @param {Object} options additional properties to be set on the event
 * @return {Promise<void>} resolves when the application is settled
 *
 * @example <caption>Usage</caption>
 *
 * import { setupRenderingTest } from 'ember-qunit';
 * import { render, triggerEvent } from '@ember/test-helpers';
 *
 * module('awesome-sauce', function(hooks) {
 *   setupRenderingTest(hooks);
 *     test('does something awesome', async function(assert) {
 *     await render(hbs`{{awesome-sauce}}`);
 *
 *     // passing an array of files
 *     let file = new File(['text file'], 'text.txt', { type: 'text/plain' });
 *     await triggerEvent('input:file', 'change', [file]);
 *
 *     // passing an object that with 'files' as a key
 *     let file = new File(['text file'], 'text.txt', { type: 'text/plain' });
 *     await triggerEvent('input:file', 'change', { files: [file] });
 *   });
 * });
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
