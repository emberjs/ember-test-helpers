import getElement from './-get-element';
import fireEvent from './fire-event';
import settled from '../settled';
import isFocusable from './-is-focusable';
import { Promise } from '../-utils';
import Target, { isDocument } from './-target';
import { log } from '@ember/test-helpers/dom/-logging';
import { runHooks, registerHook } from '../-internal/helper-hooks';
import { __blur__ } from './blur';

registerHook('focus', 'start', (target: Target) => {
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
function getClosestFocusable(
  element: HTMLElement | Element | Document | SVGElement
): HTMLElement | SVGElement | null {
  if (isDocument(element)) {
    return null;
  }

  let maybeFocusable: Element | null = element;
  while (maybeFocusable && !isFocusable(maybeFocusable)) {
    maybeFocusable = maybeFocusable.parentElement;
  }

  return maybeFocusable;
}

/**
  @private
  @param {Element} element the element to trigger events on
*/
export function __focus__(
  element: HTMLElement | Element | Document | SVGElement
): void {
  let focusTarget = getClosestFocusable(element);

  const previousFocusedElement =
    document.activeElement &&
    document.activeElement !== focusTarget &&
    isFocusable(document.activeElement)
      ? document.activeElement
      : null;

  // fire __blur__ manually with the null relatedTarget when the target is not focusable
  // and there was a previously focused element
  if (!focusTarget) {
    if (previousFocusedElement) {
      __blur__(previousFocusedElement, null);
    }

    return;
  }

  let browserIsNotFocused = document.hasFocus && !document.hasFocus();

  // fire __blur__ manually with the correct relatedTarget when the browser is not
  // already in focus and there was a previously focused element
  if (previousFocusedElement && browserIsNotFocused) {
    __blur__(previousFocusedElement, focusTarget);
  }

  // makes `document.activeElement` be `element`. If the browser is focused, it also fires a focus event
  focusTarget.focus();

  // Firefox does not trigger the `focusin` event if the window
  // does not have focus. If the document does not have focus then
  // fire `focusin` event as well.
  if (browserIsNotFocused) {
    // if the browser is not focused the previous `el.focus()` didn't fire an event, so we simulate it
    fireEvent(focusTarget, 'focus', {
      bubbles: false,
    });

    fireEvent(focusTarget, 'focusin');
  }
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
  @param {string|Element} target the element or selector to focus
  @return {Promise<void>} resolves when the application is settled

  @example
  <caption>
    Emulating focusing an input using `focus`
  </caption>

  focus('input');
*/
export default function focus(target: Target): Promise<void> {
  return Promise.resolve()
    .then(() => runHooks('focus', 'start', target))
    .then(() => {
      if (!target) {
        throw new Error('Must pass an element or selector to `focus`.');
      }

      let element = getElement(target);
      if (!element) {
        throw new Error(
          `Element not found when calling \`focus('${target}')\`.`
        );
      }

      if (!isFocusable(element)) {
        throw new Error(`${element} is not focusable`);
      }

      __focus__(element);

      return settled();
    })
    .then(() => runHooks('focus', 'end', target));
}
