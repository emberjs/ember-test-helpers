import { merge } from '@ember/polyfills';
import triggerEvent from './trigger-event';

const DEFAULT_MODIFIERS = Object.freeze({
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  metaKey: false,
});

/**
  @public
  @param {String|HTMLElement} selector
  @param {'keydown' | 'keyup' | 'keypress'} type
  @param {String} keyCode
  @param {Object} modifiers
  @param {Boolean} modifiers.ctrlKey
  @param {Boolean} modifiers.altKey
  @param {Boolean} modifiers.shiftKey
  @param {Boolean} modifiers.metaKey
  @return {Promise<void>}
*/
export default function keyEvent(selectorOrElement, type, keyCode, modifiers = DEFAULT_MODIFIERS) {
  let options = merge({ keyCode, which: keyCode, key: keyCode }, modifiers);

  return triggerEvent(selectorOrElement, type, options);
}
