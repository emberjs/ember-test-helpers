import { getWindowOrElement } from './-get-window-or-element';
import fireEvent from './fire-event';
import { __focus__ } from './focus';
import settled from '../settled';
import { DEFAULT_CLICK_OPTIONS } from './click';
import Target, { isWindow } from './-target';
import { log } from './-logging';
import isFormControl from './-is-form-control';
import { runHooks, registerHook } from '../helper-hooks';
import getDescription from './-get-description';

registerHook('doubleClick', 'start', (target: Target) => {
  log('doubleClick', target);
});

/**
  @private
  @param {Element} element the element to double-click on
  @param {MouseEventInit} options the options to be merged into the mouse events
  @returns {Promise<Event | void>} resolves when settled
*/
export function __doubleClick__(
  element: Element | Document | Window,
  options: MouseEventInit
): Promise<Event | void> {
  return Promise.resolve()
    .then(() => fireEvent(element, 'mousedown', options))
    .then((mouseDownEvent) => {
      return !isWindow(element) && !mouseDownEvent?.defaultPrevented
        ? __focus__(element)
        : Promise.resolve();
    })
    .then(() => fireEvent(element, 'mouseup', options))
    .then(() => fireEvent(element, 'click', options))
    .then(() => fireEvent(element, 'mousedown', options))
    .then(() => fireEvent(element, 'mouseup', options))
    .then(() => fireEvent(element, 'click', options))
    .then(() => fireEvent(element, 'dblclick', options));
}

/**
  Double-clicks on the specified target.

  Sends a number of events intending to simulate a "real" user clicking on an
  element.

  For non-focusable elements the following events are triggered (in order):

  - `mousedown`
  - `mouseup`
  - `click`
  - `mousedown`
  - `mouseup`
  - `click`
  - `dblclick`

  For focusable (e.g. form control) elements the following events are triggered
  (in order):

  - `mousedown`
  - `focus`
  - `focusin`
  - `mouseup`
  - `click`
  - `mousedown`
  - `mouseup`
  - `click`
  - `dblclick`

  The exact listing of events that are triggered may change over time as needed
  to continue to emulate how actual browsers handle clicking a given element.

  Use the `options` hash to change the parameters of the [MouseEvents](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent).

  @public
  @param {string|Element|IDOMElementDescriptor} target the element, selector, or descriptor to double-click on
  @param {MouseEventInit} _options the options to be merged into the mouse events
  @return {Promise<void>} resolves when settled

  @example
  <caption>
    Emulating double clicking a button using `doubleClick`
  </caption>

  doubleClick('button');

  @example
  <caption>
    Emulating double clicking a button and pressing the `shift` key simultaneously using `click` with `options`.
  </caption>

  doubleClick('button', { shiftKey: true });
*/
export default function doubleClick(
  target: Target,
  _options: MouseEventInit = {}
): Promise<void> {
  let options = { ...DEFAULT_CLICK_OPTIONS, ..._options };

  return Promise.resolve()
    .then(() => runHooks('doubleClick', 'start', target, _options))
    .then(() => {
      if (!target) {
        throw new Error(
          'Must pass an element, selector, or descriptor to `doubleClick`.'
        );
      }

      let element = getWindowOrElement(target);
      if (!element) {
        let description = getDescription(target);
        throw new Error(
          `Element not found when calling \`doubleClick('${description}')\`.`
        );
      }

      if (isFormControl(element) && element.disabled) {
        throw new Error(`Can not \`doubleClick\` disabled ${element}`);
      }

      return __doubleClick__(element, options).then(settled);
    })
    .then(() => runHooks('doubleClick', 'end', target, _options));
}
