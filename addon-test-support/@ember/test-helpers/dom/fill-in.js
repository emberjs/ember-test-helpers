import getElement from './-get-element';
import isFormControl from './-is-form-control';
import { __focus__ } from './focus';
import settled from '../settled';
import fireEvent from './fire-event';
import { nextTickPromise } from '../-utils';

/*
  @method fillIn
  @param {String|Element} target
  @param {String} text
  @return {Promise<void>}
  @public
*/
export default function fillIn(target, text) {
  return nextTickPromise().then(() => {
    let element = getElement(target);
    if (!element) {
      throw new Error(`Element not found when calling \`fillIn('${target}')\`.`);
    }

    if (!isFormControl(element) && !element.isContentEditable) {
      throw new Error('`fillIn` is only usable on form controls or contenteditable elements.');
    }

    if (!text) {
      throw new Error('Must provide `text` when calling `fillIn`.');
    }

    __focus__(element);

    if (element.isContentEditable) {
      element.innerHTML = text;
    } else {
      element.value = text;
    }

    fireEvent(element, 'input');
    fireEvent(element, 'change');

    return settled();
  });
}
