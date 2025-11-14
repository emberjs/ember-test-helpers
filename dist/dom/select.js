import getElement from './-get-element.js';
import isSelectElement from './-is-select-element.js';
import { __focus__ } from './focus.js';
import { s as settled } from '../setup-context-BSrEM03X.js';
import fireEvent from './fire-event.js';
import { runHooks } from '../helper-hooks.js';
import getDescription from './-get-description.js';

// eslint-disable-next-line require-jsdoc
function errorMessage(message, target) {
  const description = getDescription(target);
  return `${message} when calling \`select('${description}')\`.`;
}

/**
  Set the `selected` property true for the provided option the target is a
  select element (or set the select property true for multiple options if the
  multiple attribute is set true on the HTMLSelectElement) then trigger
  `change` and `input` events on the specified target.

  @public
  @param {string|Element|IDOMElementDescriptor} target the element, selector, or descriptor for the select element
  @param {string|string[]} options the value/values of the items to select
  @param {boolean} keepPreviouslySelected a flag keep any existing selections
  @return {Promise<void>} resolves when the application is settled

  @example
  <caption>
    Emulating selecting an option or multiple options using `select`
  </caption>

  select('select', 'apple');

  select('select', ['apple', 'orange']);

  select('select', ['apple', 'orange'], true);
*/
function select(target, options, keepPreviouslySelected = false) {
  return Promise.resolve().then(() => runHooks('select', 'start', target, options, keepPreviouslySelected)).then(() => {
    if (!target) {
      throw new Error('Must pass an element, selector, or descriptor to `select`.');
    }
    if (typeof options === 'undefined' || options === null) {
      throw new Error('Must provide an `option` or `options` to select when calling `select`.');
    }
    const element = getElement(target);
    if (!element) {
      throw new Error(errorMessage('Element not found', target));
    }
    if (!isSelectElement(element)) {
      throw new Error(errorMessage('Element is not a HTMLSelectElement', target));
    }
    if (element.disabled) {
      throw new Error(errorMessage('Element is disabled', target));
    }
    options = Array.isArray(options) ? options : [options];
    if (!element.multiple && options.length > 1) {
      throw new Error(errorMessage('HTMLSelectElement `multiple` attribute is set to `false` but multiple options were passed', target));
    }
    return __focus__(element).then(() => element);
  }).then(element => {
    for (let i = 0; i < element.options.length; i++) {
      const elementOption = element.options.item(i);
      if (elementOption) {
        if (options.indexOf(elementOption.value) > -1) {
          elementOption.selected = true;
        } else if (!keepPreviouslySelected) {
          elementOption.selected = false;
        }
      }
    }
    return fireEvent(element, 'input').then(() => fireEvent(element, 'change')).then(settled);
  }).then(() => runHooks('select', 'end', target, options, keepPreviouslySelected));
}

export { select as default };
//# sourceMappingURL=select.js.map
