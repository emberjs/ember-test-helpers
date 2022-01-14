import { getWindowOrElement } from './-get-window-or-element';
import fireEvent from './fire-event';
import { __focus__ } from './focus';
import settled from '../settled';
import { Promise } from '../-utils';
import isFormControl from './-is-form-control';
import Target, { isWindow } from './-target';
import { log } from '@ember/test-helpers/dom/-logging';
import { runHooks, registerHook } from '../-internal/helper-hooks';

const PRIMARY_BUTTON = 1;
const MAIN_BUTTON_PRESSED = 0;

registerHook('click', 'start', (target: Target) => {
  log('click', target);
});

/**
 * Represent a particular mouse button being clicked.
 * See https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons for available options.
 */
export const DEFAULT_CLICK_OPTIONS = {
  buttons: PRIMARY_BUTTON,
  button: MAIN_BUTTON_PRESSED,
};

/**
  @private
  @param {Element} element the element to click on
  @param {MouseEventInit} options the options to be merged into the mouse events
  @return {Promise<Event | void>} resolves when settled
*/
export function __click__(
  element: Element | Document | Window,
  options: MouseEventInit
): Promise<Event | void> {
  return Promise.resolve()
    .then(() => fireEvent(element, 'mousedown', options))
    .then((mouseDownEvent) =>
      !isWindow(element) && !mouseDownEvent?.defaultPrevented
        ? __focus__(element)
        : Promise.resolve()
    )
    .then(() => fireEvent(element, 'mouseup', options))
    .then(() => fireEvent(element, 'click', options));
}

/**
  Clicks on the specified target.

  Sends a number of events intending to simulate a "real" user clicking on an
  element.

  For non-focusable elements the following events are triggered (in order):

  - `mousedown`
  - `mouseup`
  - `click`

  For focusable (e.g. form control) elements the following events are triggered
  (in order):

  - `mousedown`
  - `focus`
  - `focusin`
  - `mouseup`
  - `click`

  The exact listing of events that are triggered may change over time as needed
  to continue to emulate how actual browsers handle clicking a given element.

  Use the `options` hash to change the parameters of the [MouseEvents](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent).
  You can use this to specifiy modifier keys as well.

  @public
  @param {string|Element} target the element or selector to click on
  @param {MouseEventInit} _options the options to be merged into the mouse events.
  @return {Promise<void>} resolves when settled

  @example
  <caption>
    Emulating clicking a button using `click`
  </caption>
  click('button');

  @example
  <caption>
    Emulating clicking a button and pressing the `shift` key simultaneously using `click` with `options`.
  </caption>

  click('button', { shiftKey: true });
*/
export default function click(
  target: Target,
  _options: MouseEventInit = {}
): Promise<void> {
  let options = { ...DEFAULT_CLICK_OPTIONS, ..._options };

  return Promise.resolve()
    .then(() => runHooks('click', 'start', target, _options))
    .then(() => {
      if (!target) {
        throw new Error('Must pass an element or selector to `click`.');
      }

      let element = getWindowOrElement(target);
      if (!element) {
        throw new Error(
          `Element not found when calling \`click('${target}')\`.`
        );
      }

      if (isFormControl(element) && element.disabled) {
        throw new Error(`Can not \`click\` disabled ${element}`);
      }

      return __click__(element, options).then(settled);
    })
    .then(() => runHooks('click', 'end', target, _options));
}
