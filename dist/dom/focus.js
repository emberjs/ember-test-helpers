import getElement from './-get-element.js';
import fireEvent from './fire-event.js';
import { s as settled } from '../setup-context-BSrEM03X.js';
import isFocusable from './-is-focusable.js';
import { isDocument } from './-target.js';
import { log } from './-logging.js';
import { registerHook, runHooks } from '../helper-hooks.js';
import { __blur__ } from './blur.js';
import getDescription from './-get-description.js';

registerHook('focus', 'start', target => {
  log('focus', target);
});
/**
   Get the closest focusable ancestor of a given element (or the element itself
   if it's focusable)

   @private
   @param {Element} element the element to trigger events on
   @returns {HTMLElement|SVGElement|null} the focusable element/ancestor or null
   if there is none
 */
function getClosestFocusable(element) {
  if (isDocument(element)) {
    return null;
  }
  let maybeFocusable = element;
  while (maybeFocusable && !isFocusable(maybeFocusable)) {
    maybeFocusable = maybeFocusable.parentElement;
  }
  return maybeFocusable;
}

/**
  @private
  @param {Element} element the element to trigger events on
  @return {Promise<FocusRecord | Event | void>} resolves when settled
*/
function __focus__(element) {
  return Promise.resolve().then(() => {
    const focusTarget = getClosestFocusable(element);
    const previousFocusedElement = document.activeElement && document.activeElement !== focusTarget && isFocusable(document.activeElement) ? document.activeElement : null;

    // fire __blur__ manually with the null relatedTarget when the target is not focusable
    // and there was a previously focused element
    return !focusTarget && previousFocusedElement ? __blur__(previousFocusedElement, null).then(() => Promise.resolve({
      focusTarget,
      previousFocusedElement
    })) : Promise.resolve({
      focusTarget,
      previousFocusedElement
    });
  }).then(({
    focusTarget,
    previousFocusedElement
  }) => {
    if (!focusTarget) {
      throw new Error('There was a previously focused element');
    }
    const browserIsNotFocused = !document?.hasFocus();

    // fire __blur__ manually with the correct relatedTarget when the browser is not
    // already in focus and there was a previously focused element
    return previousFocusedElement && browserIsNotFocused ? __blur__(previousFocusedElement, focusTarget).then(() => Promise.resolve({
      focusTarget
    })) : Promise.resolve({
      focusTarget
    });
  }).then(({
    focusTarget
  }) => {
    // makes `document.activeElement` be `element`. If the browser is focused, it also fires a focus event
    focusTarget.focus();

    // Firefox does not trigger the `focusin` event if the window
    // does not have focus. If the document does not have focus then
    // fire `focusin` event as well.
    const browserIsFocused = document?.hasFocus();
    return browserIsFocused ? Promise.resolve() :
    // if the browser is not focused the previous `el.focus()` didn't fire an event, so we simulate it
    Promise.resolve().then(() => fireEvent(focusTarget, 'focus', {
      bubbles: false
    })).then(() => fireEvent(focusTarget, 'focusin')).then(() => settled());
  }).catch(() => {});
}

/**
  Focus the specified target.

  Sends a number of events intending to simulate a "real" user focusing an
  element.

  The following events are triggered (in order):

  - `focus`
  - `focusin`

  The exact listing of events that are triggered may change over time as needed
  to continue to emulate how actual browsers handle focusing a given element.

  @public
  @param {string|Element|IDOMElementDescriptor} target the element, selector, or descriptor to focus
  @return {Promise<void>} resolves when the application is settled

  @example
  <caption>
    Emulating focusing an input using `focus`
  </caption>

  focus('input');
*/
function focus(target) {
  return Promise.resolve().then(() => runHooks('focus', 'start', target)).then(() => {
    if (!target) {
      throw new Error('Must pass an element, selector, or descriptor to `focus`.');
    }
    const element = getElement(target);
    if (!element) {
      const description = getDescription(target);
      throw new Error(`Element not found when calling \`focus('${description}')\`.`);
    }
    if (!isFocusable(element)) {
      throw new Error(`${element} is not focusable`);
    }
    return __focus__(element).then(settled);
  }).then(() => runHooks('focus', 'end', target));
}

export { __focus__, focus as default };
//# sourceMappingURL=focus.js.map
