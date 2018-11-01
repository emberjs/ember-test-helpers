import { nextTickPromise } from '../-utils';
import settled from '../settled';
import getElement from './-get-element';
import isFormControl from './-is-form-control';
import { __focus__ } from './focus';
import { Promise } from 'rsvp';
import fireEvent from './fire-event';

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
 */
export default function typeIn(target, text, options = { delay: 50 }) {
  return nextTickPromise().then(() => {
    if (!target) {
      throw new Error('Must pass an element or selector to `typeIn`.');
    }

    const element = getElement(target);
    if (!element) {
      throw new Error(`Element not found when calling \`typeIn('${target}')\``);
    }
    let isControl = isFormControl(element);
    if (!isControl) {
      throw new Error('`typeIn` is only usable on form controls.');
    }

    if (typeof text === 'undefined' || text === null) {
      throw new Error('Must provide `text` when calling `typeIn`.');
    }

    __focus__(element);

    return fillOut(element, text, options.delay)
      .then(() => fireEvent(element, 'change'))
      .then(settled);
  });
}

// eslint-disable-next-line require-jsdoc
function fillOut(element, text, delay) {
  const inputFunctions = text.split('').map(character => keyEntry(element, character, delay));
  return inputFunctions.reduce((currentPromise, func) => {
    return currentPromise.then(() => delayedExecute(func, delay));
  }, Promise.resolve());
}

// eslint-disable-next-line require-jsdoc
function keyEntry(element, character) {
  const charCode = character.charCodeAt();

  const eventOptions = {
    bubbles: true,
    cancellable: true,
    charCode,
  };

  const keyEvents = {
    down: new KeyboardEvent('keydown', eventOptions),
    press: new KeyboardEvent('keypress', eventOptions),
    up: new KeyboardEvent('keyup', eventOptions),
  };

  return function() {
    element.dispatchEvent(keyEvents.down);
    element.dispatchEvent(keyEvents.press);
    element.value = element.value + character;
    fireEvent(element, 'input');
    element.dispatchEvent(keyEvents.up);
  };
}

// eslint-disable-next-line require-jsdoc
function delayedExecute(func, delay) {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  }).then(func);
}
