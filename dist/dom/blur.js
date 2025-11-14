import getElement from './-get-element.js';
import fireEvent from './fire-event.js';
import { s as settled } from '../setup-context-BSrEM03X.js';
import { log } from './-logging.js';
import isFocusable from './-is-focusable.js';
import { registerHook, runHooks } from '../helper-hooks.js';
import getDescription from './-get-description.js';

registerHook('blur', 'start', target => {
  log('blur', target);
});

/**
  @private
  @param {Element} element the element to trigger events on
  @param {Element} relatedTarget the element that is focused after blur
  @return {Promise<Event | void>} resolves when settled
*/
function __blur__(element, relatedTarget = null) {
  if (!isFocusable(element)) {
    throw new Error(`${element} is not focusable`);
  }
  const browserIsNotFocused = document.hasFocus && !document.hasFocus();
  const needsCustomEventOptions = relatedTarget !== null;
  if (!needsCustomEventOptions) {
    // makes `document.activeElement` be `body`.
    // If the browser is focused, it also fires a blur event
    element.blur();
  }

  // Chrome/Firefox does not trigger the `blur` event if the window
  // does not have focus. If the document does not have focus then
  // fire `blur` event via native event.
  const options = {
    relatedTarget
  };
  return browserIsNotFocused || needsCustomEventOptions ? Promise.resolve().then(() => fireEvent(element, 'blur', {
    bubbles: false,
    ...options
  })).then(() => fireEvent(element, 'focusout', options)) : Promise.resolve();
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
  @param {string|Element|IDOMElementDescriptor} [target=document.activeElement] the element, selector, or descriptor to unfocus
  @return {Promise<void>} resolves when settled

  @example
  <caption>
    Emulating blurring an input using `blur`
  </caption>

  blur('input');
*/
function blur(target = document.activeElement) {
  return Promise.resolve().then(() => runHooks('blur', 'start', target)).then(() => {
    const element = getElement(target);
    if (!element) {
      const description = getDescription(target);
      throw new Error(`Element not found when calling \`blur('${description}')\`.`);
    }
    return __blur__(element).then(() => settled());
  }).then(() => runHooks('blur', 'end', target));
}

export { __blur__, blur as default };
//# sourceMappingURL=blur.js.map
