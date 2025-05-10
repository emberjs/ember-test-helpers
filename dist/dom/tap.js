import getElement from './-get-element.js';
import fireEvent from './fire-event.js';
import { __click__ } from './click.js';
import { s as settled } from '../setup-context-BSrEM03X.js';
import { log } from './-logging.js';
import isFormControl from './-is-form-control.js';
import { registerHook, runHooks } from '../helper-hooks.js';
import getDescription from './-get-description.js';

registerHook('tap', 'start', target => {
  log('tap', target);
});

/**
  Taps on the specified target.

  Sends a number of events intending to simulate a "real" user tapping on an
  element.

  For non-focusable elements the following events are triggered (in order):

  - `touchstart`
  - `touchend`
  - `mousedown`
  - `mouseup`
  - `click`

  For focusable (e.g. form control) elements the following events are triggered
  (in order):

  - `touchstart`
  - `touchend`
  - `mousedown`
  - `focus`
  - `focusin`
  - `mouseup`
  - `click`

  The exact listing of events that are triggered may change over time as needed
  to continue to emulate how actual browsers handle tapping on a given element.

  Use the `options` hash to change the parameters of the tap events.

  @public
  @param {string|Element|IDOMElementDescriptor} target the element, selector, or descriptor to tap on
  @param {Object} options the options to be merged into the touch events
  @return {Promise<void>} resolves when settled

  @example
  <caption>
    Emulating tapping a button using `tap`
  </caption>

  tap('button');
*/
function tap(target, options = {}) {
  return Promise.resolve().then(() => {
    return runHooks('tap', 'start', target, options);
  }).then(() => {
    if (!target) {
      throw new Error('Must pass an element, selector, or descriptor to `tap`.');
    }
    const element = getElement(target);
    if (!element) {
      const description = getDescription(target);
      throw new Error(`Element not found when calling \`tap('${description}')\`.`);
    }
    if (isFormControl(element) && element.disabled) {
      throw new Error(`Can not \`tap\` disabled ${element}`);
    }
    return fireEvent(element, 'touchstart', options).then(touchstartEv => fireEvent(element, 'touchend', options).then(touchendEv => [touchstartEv, touchendEv])).then(([touchstartEv, touchendEv]) => !touchstartEv.defaultPrevented && !touchendEv.defaultPrevented ? __click__(element, options) : Promise.resolve()).then(settled);
  }).then(() => {
    return runHooks('tap', 'end', target, options);
  });
}

export { tap as default };
//# sourceMappingURL=tap.js.map
