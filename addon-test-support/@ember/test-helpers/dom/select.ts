import getElement from './-get-element';
import isSelectElement from './-is-select-element';
import { __focus__ } from './focus';
import settled from '../settled';
import fireEvent from './fire-event';
import { nextTickPromise } from '../-utils';
import Target from './-target';

/**
  Set the `selected` property true for the provided option the target is a
  select element (or set the select property true for multiple options if the
  multiple attribute is set true on the HTMLSelectElement) then trigger
  `change` and `input` events on the specified target.

  @public
  @param {string|Element} target the element or selector for the select element
  @param {string|string[]} options the value/values of the items to select
  @param {boolean} clearPreviouslySelected a flag to clear any previous selections
  @return {Promise<void>} resolves when the application is settled

  @example
  <caption>
    Emulating selecting an option or multiple options using `select`
  </caption>

  select('select', 'apple');

  select('select', ['apple', 'orange']);

  select('select', ['apple', 'orange'], true);
*/
export default function select(
  target: Target,
  options: string | string[],
  clearPreviouslySelected?: boolean
): Promise<void> {
  return nextTickPromise().then(() => {
    if (!target) {
      throw new Error('Must pass an element or selector to `select`.');
    }

    if (typeof options === 'undefined' || options === null) {
      throw new Error('Must provide an `option` or `options` to select when calling `select`.');
    }

    const element = getElement(target) as any;
    if (!element) {
      throw new Error(`Element not found when calling \`select('${target}')\`.`);
    }
    const isSelect = isSelectElement(element);
    if (!isSelect) {
      throw new Error('`select` is only usable on a HTMLSelectElement');
    }

    if (element.disabled) {
      throw new Error('Element is disabled');
    }

    options = Array.isArray(options) ? options : [options];

    if (!element.multiple && options.length > 1) {
      throw new Error(
        'HTMLSelectElement `multiple` attribute is set to `false` but multiple options have been passed'
      );
    }

    __focus__(element);

    for (let i = 0; i < element.options.length; i++) {
      let elementOption = element.options.item(i);
      if (options.indexOf(elementOption.value) > -1) {
        elementOption.selected = true;
      } else if (clearPreviouslySelected || element.multiple == false) {
        elementOption.selected = false;
      }
    }

    fireEvent(element, 'input');
    fireEvent(element, 'change');

    return settled();
  });
}
