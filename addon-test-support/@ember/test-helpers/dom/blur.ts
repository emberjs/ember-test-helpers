import getElement from './-get-element';
import fireEvent from './fire-event';
import settled from '../settled';
import { Promise } from '../-utils';
import Target from './-target';
import { log } from '@ember/test-helpers/dom/-logging';
import isFocusable from './-is-focusable';
import { runHooks, registerHook } from '../-internal/helper-hooks';

registerHook('blur', 'start', (target: Target) => {
  log('blur', target);
});

/**
  @private
  @param {Element} element the element to trigger events on
  @param {Element} relatedTarget the element that is focused after blur
  @return {Promise<Event | void>} resolves when settled
*/
export function __blur__(
  element: HTMLElement | Element | Document | SVGElement,
  relatedTarget: HTMLElement | Element | Document | SVGElement | null = null
): Promise<Event | void> {
  if (!isFocusable(element)) {
    throw new Error(`${element} is not focusable`);
  }

  let browserIsNotFocused = document.hasFocus && !document.hasFocus();
  let needsCustomEventOptions = relatedTarget !== null;

  if (!needsCustomEventOptions) {
    // makes `document.activeElement` be `body`.
    // If the browser is focused, it also fires a blur event
    element.blur();
  }

  // Chrome/Firefox does not trigger the `blur` event if the window
  // does not have focus. If the document does not have focus then
  // fire `blur` event via native event.
  let options = { relatedTarget };
  return browserIsNotFocused || needsCustomEventOptions
    ? Promise.resolve()
        .then(() => fireEvent(element, 'blur', { bubbles: false, ...options }))
        .then(() => fireEvent(element, 'focusout', options))
    : Promise.resolve();
}

/**
  Unfocus the specified target.

  Sends a number of events intending to simulate a "real" user unfocusing an
  element.

  The following events are triggered (in order):

  - `blur`
  - `focusout`

  The exact listing of events that are triggered may change over time as needed
  to continue to emulate how actual browsers handle unfocusing a given element.

  @public
  @param {string|Element} [target=document.activeElement] the element or selector to unfocus
  @return {Promise<void>} resolves when settled

  @example
  <caption>
    Emulating blurring an input using `blur`
  </caption>

  blur('input');
*/
export default function blur(
  target: Target = document.activeElement!
): Promise<void> {
  return Promise.resolve()
    .then(() => runHooks('blur', 'start', target))
    .then(() => {
      let element = getElement(target);
      if (!element) {
        throw new Error(
          `Element not found when calling \`blur('${target}')\`.`
        );
      }

      return __blur__(element).then(() => settled());
    })
    .then(() => runHooks('blur', 'end', target));
}
