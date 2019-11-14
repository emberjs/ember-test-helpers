import { module, test } from 'qunit';
import { select, setupContext, teardownContext } from '@ember/test-helpers';
import { buildInstrumentedElement } from '../../helpers/events';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import { isIE11 } from '../../helpers/browser-detect';

let clickSteps = ['focus', 'focusin', 'input', 'change'];

if (isIE11) {
  clickSteps = ['focusin', 'input', 'change', 'focus'];
}

module('DOM Helper: select', function(hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  let context, element;

  hooks.beforeEach(function() {
    context = {};
  });

  hooks.afterEach(async function() {
    element.setAttribute('data-skip-steps', true);
    if (element) {
      element.parentNode.removeChild(element);
    }
    if (context.owner) {
      await teardownContext(context);
    }

    document.getElementById('ember-testing').innerHTML = '';
  });

  test('select without target', async function(assert) {
    await setupContext(context);
    assert.rejects(select(), /Must pass an element or selector to `select`./);
  });

  test('select without options', async function(assert) {
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

  test('select with unfindable selector ', async function(assert) {
    element = buildInstrumentedElement('div');
    const option = 'example';

    await setupContext(context);

    assert.rejects(
      select('#fake-selector', option),
      /Element not found when calling `select\('#fake-selector'\)`/
    );
  });

  test('select with element that is not a HTMLSelectElement', async function(assert) {
    element = buildInstrumentedElement('input');

    const option = 'example';

    await setupContext(context);

    assert.rejects(select(element, option), /`select` is only usable on a HTMLSelectElement/);
  });

  test('select with element that is disabled', async function(assert) {
    element = buildInstrumentedElement('select');
    element.disabled = true;
    const option = 'example';

    await setupContext(context);

    assert.rejects(select(element, option), /Element is disabled/);
  });

  test('select | multiple: false - options.length > 1', async function(assert) {
    element = buildInstrumentedElement('select');
    element.multiple = false;
    const options = ['apple', 'orange'];

    await setupContext(context);

    assert.rejects(
      select(element, options),
      /HTMLSelectElement multiple attribute is set to false but multiple options have been passed/
    );
  });

  test('select | 4 options - multple: true - optionsToSelect.length : 2', async function(assert) {
    const optionValues = ['apple', 'orange', 'pineapple', 'pear'];
    element = buildInstrumentedElement('select');
    element.multiple = true;

    optionValues.forEach(optionValue => {
      const optionElement = buildInstrumentedElement('option');
      optionElement.value = optionValue;
      element.append(optionElement);
    });

    const optionsToSelect = ['apple', 'orange'];

    await setupContext(context);

    await select(element, optionsToSelect);

    assert.verifySteps(clickSteps);
    assert.equal(element.selectedOptions.length, 2);
    assert.equal(element.selectedOptions[0].value, 'apple');
    assert.equal(element.selectedOptions[1].value, 'orange');
  });

  test('select | 4 options - multple: false - optionsToSelect.length : 1', async function(assert) {
    const optionValues = ['apple', 'orange', 'pineapple', 'pear'];
    element = buildInstrumentedElement('select');
    element.multiple = false;

    optionValues.forEach(optionValue => {
      const optionElement = buildInstrumentedElement('option');
      optionElement.value = optionValue;
      element.append(optionElement);
    });

    const optionsToSelect = 'apple';

    await setupContext(context);

    await select(element, optionsToSelect);

    assert.verifySteps(clickSteps);
    assert.equal(element.selectedIndex, 0);
  });
});
