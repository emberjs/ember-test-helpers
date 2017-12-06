import { merge } from '@ember/polyfills';
import triggerEvent from './trigger-event';

/**
  @public
  @param selector
  @param type
  @param keyCode
  @param modifiers
  @return {*}
*/
export default function keyEvent(
  selectorOrElement,
  type,
  keyCode,
  modifiers = { ctrlKey: false, altKey: false, shiftKey: false, metaKey: false }
) {
  return triggerEvent(
    selectorOrElement,
    type,
    merge({ keyCode, which: keyCode, key: keyCode }, modifiers)
  );
}
