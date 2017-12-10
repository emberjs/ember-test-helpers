import getElement from './-get-element';
import isFormControl from './-is-form-control';
import isContentEditable from './-is-content-editable';
import { __focus__ } from './focus';
import settled from '../settled';
import { fireEvent } from './fire-event';
import { nextTickPromise } from '../-utils';

/*
  @method fillIn
  @param {String|HTMLElement} target
  @param {String} text
  @return {Promise<void>}
  @public
*/
export function fillIn(target, text) {
  let element = getElement(target);
  if (!element) {
    throw new Error(`Element not found when calling \`fillIn('${target}')\`.`);
  }

  if (!isFormControl(element) && !isContentEditable(element)) {
    throw new Error('`fillIn` is only usable on form controls or contenteditable elements.');
  }

  return nextTickPromise().then(() => {
    __focus__(element);

    if (isContentEditable(element)) {
      element.innerHTML = text;
    } else {
      element.value = text;
    }

    fireEvent(element, 'input');
    fireEvent(element, 'change');

    return settled();
  });
}
