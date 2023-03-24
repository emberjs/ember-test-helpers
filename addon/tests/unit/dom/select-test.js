import { module, test } from 'qunit';
import { select, setupContext, teardownContext } from '@ember/test-helpers';
import { buildInstrumentedElement, insertElement } from '../../helpers/events';
import {
  buildExpectedSteps,
  registerHooks,
  unregisterHooks,
} from '../../helpers/register-hooks';

let selectSteps = ['focus', 'focusin', 'input', 'change'];
let additionalSteps = ['input', 'change'];

module('DOM Helper: select', function (hooks) {
  let context, element;

  hooks.beforeEach(function () {
    context = {};
  });

  hooks.afterEach(async function () {
    if (element) {
      element.setAttribute('data-skip-steps', true);
      element.parentNode.removeChild(element);
      element = null;
    }
    if (context.owner) {
      await teardownContext(context);
    }

    document.getElementById('ember-testing').innerHTML = '';
  });

  test('it executes registered select hooks', async function (assert) {
    assert.expect(11);

    element = document.createElement('select');
    insertElement(element);

    const expectedEvents = ['input', 'change'];
    const mockHooks = registerHooks(assert, 'select', { expectedEvents });

    try {
      await select(element, 'apple');

      const expectedSteps = buildExpectedSteps('select', { expectedEvents });
      assert.verifySteps(expectedSteps);
    } finally {
      unregisterHooks(mockHooks);
    }
  });

  test('select without target', async function (assert) {
    await setupContext(context);
    assert.rejects(select(), /Must pass an element or selector to `select`./);
  });

  test('select without options', async function (assert) {
    element = buildInstrumentedElement('div');

    await setupContext(context);

    assert.rejects(
      select(element, undefined),
      /Must provide an `option` or `options` to select when calling `select`./
    );
    assert.rejects(
      select(element, null),
      /Must provide an `option` or `options` to select when calling `select`./
    );
  });

  test('select with unfindable selector ', async function (assert) {
    element = buildInstrumentedElement('div');
    const option = 'example';

    await setupContext(context);

    assert.rejects(
      select('#fake-selector', option),
      /Element not found when calling `select\('#fake-selector'\)`/
    );
  });

  test('select with element that is not a HTMLSelectElement', async function (assert) {
    element = buildInstrumentedElement('input');

    const option = 'example';

    await setupContext(context);

    assert.rejects(
      select(element, option),
      `Element is not a HTMLSelectElement when calling \`select(${element})\``
    );
  });

  test('select with element that is disabled', async function (assert) {
    element = buildInstrumentedElement('select');
    element.disabled = true;
    const option = 'example';

    await setupContext(context);

    assert.rejects(
      select(element, option),
      `Element is disabled when calling \`select(${element})\`./`
    );
  });

  test('select | multiple: false - options.length > 1', async function (assert) {
    element = buildInstrumentedElement('select');
    element.multiple = false;
    const options = ['apple', 'orange'];

    await setupContext(context);

    assert.rejects(
      select(element, options),
      `HTMLSelectElement \`multiple\` attribute is set to \`false\` but multiple options have been passed when calling \`select(${element})\``
    );
  });

  test('select | 4 options - multiple: true - optionsToSelect.length : 2', async function (assert) {
    const optionValues = ['apple', 'orange', 'pineapple', 'pear'];
    element = buildInstrumentedElement('select');
    element.multiple = true;

    optionValues.forEach((optionValue) => {
      const optionElement = buildInstrumentedElement('option');
      optionElement.value = optionValue;
      element.appendChild(optionElement);
    });

    const optionsToSelect = ['apple', 'orange'];

    await setupContext(context);

    await select(element, optionsToSelect);

    assert.verifySteps(selectSteps);
    assert.equal(element.selectedOptions.length, 2);
    assert.equal(element.selectedOptions[0].value, 'apple');
    assert.equal(element.selectedOptions[1].value, 'orange');
  });

  test('select | 4 options - multiple: false - optionsToSelect.length : 1', async function (assert) {
    const optionValues = ['apple', 'orange', 'pineapple', 'pear'];
    element = buildInstrumentedElement('select');
    element.multiple = false;

    optionValues.forEach((optionValue) => {
      const optionElement = buildInstrumentedElement('option');
      optionElement.value = optionValue;
      element.appendChild(optionElement);
    });

    const optionsToSelect = 'apple';

    await setupContext(context);

    await select(element, optionsToSelect);

    assert.verifySteps(selectSteps);
    assert.equal(element.selectedIndex, 0);
  });

  test('select | multiple: false | select new option', async function (assert) {
    const optionValues = ['apple', 'orange', 'pineapple', 'pear'];
    element = buildInstrumentedElement('select');
    element.multiple = false;

    optionValues.forEach((optionValue) => {
      const optionElement = buildInstrumentedElement('option');
      optionElement.value = optionValue;
      element.appendChild(optionElement);
    });

    await setupContext(context);

    await select(element, 'apple');

    await select(element, 'orange');

    assert.verifySteps([...selectSteps, ...additionalSteps]);
    assert.equal(element.selectedIndex, 1);
  });

  test('select | multiple: true | keepPreviouslySelected: true', async function (assert) {
    const optionValues = ['apple', 'orange', 'pineapple', 'pear'];
    element = buildInstrumentedElement('select');
    element.multiple = true;

    optionValues.forEach((optionValue) => {
      const optionElement = buildInstrumentedElement('option');
      optionElement.value = optionValue;
      element.appendChild(optionElement);
    });

    await setupContext(context);

    await select(element, 'apple');

    await select(element, 'orange', true);

    assert.verifySteps([...selectSteps, ...additionalSteps]);
    assert.equal(element.selectedOptions[0].value, 'apple');
    assert.equal(element.selectedOptions[1].value, 'orange');
  });

  test('select | multiple: true | keepPreviouslySelected: false', async function (assert) {
    const optionValues = ['apple', 'orange', 'pineapple', 'pear'];
    element = buildInstrumentedElement('select');
    element.multiple = true;

    optionValues.forEach((optionValue) => {
      const optionElement = buildInstrumentedElement('option');
      optionElement.value = optionValue;
      element.appendChild(optionElement);
    });

    await setupContext(context);

    await select(element, 'apple');

    await select(element, 'orange', false);

    assert.verifySteps([...selectSteps, ...additionalSteps]);
    assert.equal(element.selectedOptions[0].value, 'orange');
    assert.equal(element.selectedOptions.length, 1);
  });
});
