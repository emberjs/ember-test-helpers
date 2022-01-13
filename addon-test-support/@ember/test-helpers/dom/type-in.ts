import { Promise } from '../-utils';
import settled from '../settled';
import getElement from './-get-element';
import isFormControl, { FormControl } from './-is-form-control';
import { __focus__ } from './focus';
import fireEvent from './fire-event';
import guardForMaxlength from './-guard-for-maxlength';
import Target, {
  isContentEditable,
  isDocument,
  HTMLElementContentEditable,
} from './-target';
import { __triggerKeyEvent__ } from './trigger-key-event';
import { log } from '@ember/test-helpers/dom/-logging';
import { runHooks, registerHook } from '../-internal/helper-hooks';

export interface Options {
  delay?: number;
}

registerHook('typeIn', 'start', (target: Target, text: string) => {
  log('typeIn', target, text);
});

/**
 * Mimics character by character entry into the target `input` or `textarea` element.
 *
 * Allows for simulation of slow entry by passing an optional millisecond delay
 * between key events.

 * The major difference between `typeIn` and `fillIn` is that `typeIn` triggers
 * keyboard events as well as `input` and `change`.
 * Typically this looks like `focus` -> `focusin` -> `keydown` -> `keypress` -> `keyup` -> `input` -> `change`
 * per character of the passed text (this may vary on some browsers).
 *
 * @public
 * @param {string|Element} target the element or selector to enter text into
 * @param {string} text the test to fill the element with
 * @param {Object} options {delay: x} (default 50) number of milliseconds to wait per keypress
 * @return {Promise<void>} resolves when the application is settled
 *
 * @example
 * <caption>
 *   Emulating typing in an input using `typeIn`
 * </caption>
 *
 * typeIn('input', 'hello world');
 */
export default function typeIn(
  target: Target,
  text: string,
  options: Options = {}
): Promise<void> {
  return Promise.resolve()
    .then(() => {
      return runHooks('typeIn', 'start', target, text, options);
    })
    .then(() => {
      if (!target) {
        throw new Error('Must pass an element or selector to `typeIn`.');
      }

      const element = getElement(target);

      if (!element) {
        throw new Error(
          `Element not found when calling \`typeIn('${target}')\``
        );
      }

      if (
        isDocument(element) ||
        (!isFormControl(element) && !isContentEditable(element))
      ) {
        throw new Error(
          '`typeIn` is only usable on form controls or contenteditable elements.'
        );
      }

      if (typeof text === 'undefined' || text === null) {
        throw new Error('Must provide `text` when calling `typeIn`.');
      }

      if (isFormControl(element)) {
        if (element.disabled) {
          throw new Error(`Can not \`typeIn\` disabled '${target}'.`);
        }

        if ('readOnly' in element && element.readOnly) {
          throw new Error(`Can not \`typeIn\` readonly '${target}'.`);
        }
      }

      let { delay = 50 } = options;

      return __focus__(element)
        .then(() => fillOut(element, text, delay))
        .then(() => fireEvent(element, 'change'))
        .then(settled)
        .then(() => runHooks('typeIn', 'end', target, text, options));
    });
}

// eslint-disable-next-line require-jsdoc
function fillOut(
  element: FormControl | HTMLElementContentEditable,
  text: string,
  delay: number
) {
  const inputFunctions = text
    .split('')
    .map((character) => keyEntry(element, character));
  return inputFunctions.reduce((currentPromise, func) => {
    return currentPromise.then(() => delayedExecute(delay)).then(func);
  }, Promise.resolve(undefined));
}

// eslint-disable-next-line require-jsdoc
function keyEntry(
  element: FormControl | HTMLElementContentEditable,
  character: string
): () => void {
  let shiftKey =
    character === character.toUpperCase() &&
    character !== character.toLowerCase();
  let options = { shiftKey };
  let characterKey = character.toUpperCase();

  return function () {
    return Promise.resolve()
      .then(() =>
        __triggerKeyEvent__(element, 'keydown', characterKey, options)
      )
      .then(() =>
        __triggerKeyEvent__(element, 'keypress', characterKey, options)
      )
      .then(() => {
        if (isFormControl(element)) {
          const newValue = element.value + character;
          guardForMaxlength(element, newValue, 'typeIn');

          element.value = newValue;
        } else {
          const newValue = element.innerHTML + character;
          element.innerHTML = newValue;
        }
        return fireEvent(element, 'input');
      })
      .then(() => __triggerKeyEvent__(element, 'keyup', characterKey, options));
  };
}

// eslint-disable-next-line require-jsdoc
function delayedExecute(delay: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}
