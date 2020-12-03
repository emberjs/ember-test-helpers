import getElement from './-get-element';
import fireEvent from './fire-event';
import settled from '../settled';
import isFocusable from './-is-focusable';
import { Promise } from '../-utils';
import Target from './-target';
import { log } from '@ember/test-helpers/dom/-logging';
import { runHooks, registerHook } from '../-internal/helper-hooks';
import { __blur__ } from './blur';

registerHook('focus', 'start', (target: Target) => {
  log('focus', target);
});

/**
  @private
  @param {Element} element the element to trigger events on
*/
export function __focus__(element: HTMLElement | Element | Document | SVGElement): void {
  if (!isFocusable(element)) {
    throw new Error(`${element} is not focusable`);
  }

  let browserIsNotFocused = document.hasFocus && !document.hasFocus();

  if (
    document.activeElement &&
    document.activeElement !== element &&
    isFocusable(document.activeElement)
  ) {
    __blur__(document.activeElement);
  }

  // makes `document.activeElement` be `element`. If the browser is focused, it also fires a focus event
  element.focus();

  // Firefox does not trigger the `focusin` event if the window
  // does not have focus. If the document does not have focus then
  // fire `focusin` event as well.
  if (browserIsNotFocused) {
    // if the browser is not focused the previous `el.focus()` didn't fire an event, so we simulate it
    fireEvent(element, 'focus', {
      bubbles: false,
    });

    fireEvent(element, 'focusin');
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
        throw new Error(`Element not found when calling \`focus('${target}')\`.`);
      }

      __focus__(element);

      return settled();
    })
    .then(() => runHooks('focus', 'end', target));
}
