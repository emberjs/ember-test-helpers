import getElement from './-get-element';
import fireEvent from './fire-event';
import { __focus__ } from './focus';
import settled from '../settled';
import isFocusable from './-is-focusable';
import { nextTickPromise } from '../-utils';

/**
  @private
  @method __click__
  @param {Element} element the element to trigger events on
*/
export function __click__(element) {
  fireEvent(element, 'mousedown');

  if (isFocusable(element)) {
    __focus__(element);
  }

  fireEvent(element, 'mouseup');
  fireEvent(element, 'click');
}

/**
  Clicks on the specified target.

  @public
  @method click
  @param {string|Element} target the element or selector to click on
  @return {Promise<void>} resolves when the application is settled
*/
export default function click(target) {
  return nextTickPromise().then(() => {
    if (!target) {
      throw new Error('Must pass an element or selector to `click`.');
    }

    let element = getElement(target);
    if (!element) {
      throw new Error(`Element not found when calling \`click('${target}')\`.`);
    }

    __click__(element);
    return settled();
  });
}
