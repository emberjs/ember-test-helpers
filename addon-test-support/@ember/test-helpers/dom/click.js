import getElement from './-get-element';
import fireEvent from './fire-event';
import { __focus__ } from './focus';
import settled from '../settled';
import isFocusable from './-is-focusable';
import { nextTickPromise } from '../-utils';

/**
  @method click
  @param {String|Element} target
  @return {Promise<void>}
  @public
*/
export default function click(target) {
  let element = getElement(target);
  if (!element) {
    throw new Error(`Element not found when calling \`click('${target}')\`.`);
  }

  return nextTickPromise().then(() => {
    fireEvent(element, 'mousedown');

    if (isFocusable(element)) {
      __focus__(element);
    }

    fireEvent(element, 'mouseup');
    fireEvent(element, 'click');

    return settled();
  });
}
