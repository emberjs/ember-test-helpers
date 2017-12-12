import { merge } from '@ember/polyfills';
import getElement from './-get-element';
import triggerEvent from './trigger-event';
import { KEYBOARD_EVENT_TYPES } from './fire-event';

const DEFAULT_MODIFIERS = Object.freeze({
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  metaKey: false,
});

/**
  @public
  @param {String|Element} target
  @param {'keydown' | 'keyup' | 'keypress'} eventType
  @param {String} keyCode
  @param {Object} [modifiers]
  @param {Boolean} [modifiers.ctrlKey=false]
  @param {Boolean} [modifiers.altKey=false]
  @param {Boolean} [modifiers.shiftKey=false]
  @param {Boolean} [modifiers.metaKey=false]
  @return {Promise<void>}
*/
export default function triggerKeyEvent(target, eventType, keyCode, modifiers = DEFAULT_MODIFIERS) {
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
    throw new Error(
      `Must provide an \`eventType\` of ${KEYBOARD_EVENT_TYPES.join(
        ', '
      )} to \`triggerKeyEvent\` but you passed \`${eventType}\`.`
    );
  }

  if (!keyCode) {
    throw new Error(`Must provide a \`keyCode\` to \`triggerKeyEvent\``);
  }

  let options = merge({ keyCode, which: keyCode, key: keyCode }, modifiers);

  return triggerEvent(element, eventType, options);
}
