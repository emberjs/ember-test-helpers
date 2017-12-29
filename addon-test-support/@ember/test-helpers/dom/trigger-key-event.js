import { merge } from '@ember/polyfills';
import getElement from './-get-element';
import fireEvent from './fire-event';
import settled from '../settled';
import { KEYBOARD_EVENT_TYPES } from './fire-event';
import { nextTickPromise } from '../-utils';

const DEFAULT_MODIFIERS = Object.freeze({
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  metaKey: false,
});

/**
  Triggers a keyboard event on the specified target.

  @public
  @param {string|Element} target the element or selector to trigger the event on
  @param {'keydown' | 'keyup' | 'keypress'} eventType the type of event to trigger
  @param {string} keyCode the keyCode of the event being triggered
  @param {Object} [modifiers] the state of various modifier keys
  @param {boolean} [modifiers.ctrlKey=false] if true the generated event will indicate the control key was pressed during the key event
  @param {boolean} [modifiers.altKey=false] if true the generated event will indicate the alt key was pressed during the key event
  @param {boolean} [modifiers.shiftKey=false] if true the generated event will indicate the shift key was pressed during the key event
  @param {boolean} [modifiers.metaKey=false] if true the generated event will indicate the meta key was pressed during the key event
  @return {Promise<void>} resolves when the application is settled
*/
export default function triggerKeyEvent(target, eventType, keyCode, modifiers = DEFAULT_MODIFIERS) {
  return nextTickPromise().then(() => {
    if (!target) {
      throw new Error('Must pass an element or selector to `triggerKeyEvent`.');
    }

    let element = getElement(target);
    if (!element) {
      throw new Error(`Element not found when calling \`triggerKeyEvent('${target}', ...)\`.`);
    }

    if (!eventType) {
      throw new Error(`Must provide an \`eventType\` to \`triggerKeyEvent\``);
    }

    if (KEYBOARD_EVENT_TYPES.indexOf(eventType) === -1) {
      let validEventTypes = KEYBOARD_EVENT_TYPES.join(', ');
      throw new Error(
        `Must provide an \`eventType\` of ${validEventTypes} to \`triggerKeyEvent\` but you passed \`${eventType}\`.`
      );
    }

    if (!keyCode) {
      throw new Error(`Must provide a \`keyCode\` to \`triggerKeyEvent\``);
    }

    let options = merge({ keyCode, which: keyCode, key: keyCode }, modifiers);

    fireEvent(element, eventType, options);

    return settled();
  });
}
