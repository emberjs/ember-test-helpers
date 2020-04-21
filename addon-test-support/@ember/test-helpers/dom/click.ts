import getElement from './-get-element';
import fireEvent from './fire-event';
import { __focus__ } from './focus';
import settled from '../settled';
import isFocusable from './-is-focusable';
import { nextTickPromise } from '../-utils';
import isFormControl from './-is-form-control';
import Target from './-target';
import { log } from '@ember/test-helpers/dom/-logging';

/**
  @private
  @param {Element} element the element to click on
  @param {Object} options the options to be merged into the mouse events
*/
export function __click__(element: Element, options: MouseEventInit): void {
  fireEvent(element, 'mousedown', options);

  if (isFocusable(element)) {
    __focus__(element);
  }

  fireEvent(element, 'mouseup', options);
  fireEvent(element, 'click', options);
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
  @param {Object} options the options to be merged into the mouse events
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
export default function click(target: Target, options: MouseEventInit = {}): Promise<void> {
  log('click', target);

  return nextTickPromise().then(() => {
    if (!target) {
      throw new Error('Must pass an element or selector to `click`.');
    }

    let element = getElement(target);
    if (!element) {
      throw new Error(`Element not found when calling \`click('${target}')\`.`);
    }

    if (isFormControl(element) && element.disabled) {
      throw new Error(`Can not \`click\` disabled ${element}`);
    }

    __click__(element, options);

    return settled();
  });
}
