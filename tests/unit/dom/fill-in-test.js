import { module, test } from 'qunit';
import { fillIn, setupContext, teardownContext } from '@ember/test-helpers';
import { buildInstrumentedElement } from '../../helpers/events';
import { isIE11 } from '../../helpers/browser-detect';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';

let clickSteps = ['focus', 'focusin', 'input', 'change'];

if (isIE11) {
  clickSteps = ['focusin', 'input', 'change', 'focus'];
}

module('DOM Helper: fillIn', function(hooks) {
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

  test('filling in a non-fillable element', async function(assert) {
    element = buildInstrumentedElement('div');

    await setupContext(context);
    assert.rejects(
      fillIn(`#${element.id}`, 'foo'),
      /`fillIn` is only usable on form controls or contenteditable elements/
    );
  });

  test('rejects if selector is not found', async function(assert) {
    element = buildInstrumentedElement('div');

    await setupContext(context);

    assert.rejects(
      fillIn(`#foo-bar-baz-not-here-ever-bye-bye`, 'foo'),
      /Element not found when calling `fillIn\('#foo-bar-baz-not-here-ever-bye-bye'\)`/
    );
  });

  test('rejects if text to fill in is not provided', async function(assert) {
    element = buildInstrumentedElement('input');

    assert.rejects(fillIn(element), /Must provide `text` when calling `fillIn`/);
  });

  test('filling an input via selector without context set', async function(assert) {
    element = buildInstrumentedElement('input');

    assert.rejects(
      fillIn(`#${element.id}`, 'foo'),
      /Must setup rendering context before attempting to interact with elements/
    );
  });

  test('does not run sync', async function(assert) {
    element = buildInstrumentedElement('input');

    let promise = fillIn(element, 'foo');

    assert.verifySteps([]);

    await promise;

    assert.verifySteps(clickSteps);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.equal(element.value, 'foo');
  });

  test('filling a textarea via selector with context set', async function(assert) {
    element = buildInstrumentedElement('textarea');

    await setupContext(context);
    await fillIn(`#${element.id}`, 'foo');

    assert.verifySteps(clickSteps);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.equal(element.value, 'foo');
  });

  test('filling an input via element with context set', async function(assert) {
    element = buildInstrumentedElement('textarea');

    await setupContext(context);
    await fillIn(element, 'foo');

    assert.verifySteps(clickSteps);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.equal(element.value, 'foo');
  });

  test('filling an input via selector with context set', async function(assert) {
    element = buildInstrumentedElement('input');

    await setupContext(context);
    await fillIn(`#${element.id}`, 'foo');

    assert.verifySteps(clickSteps);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.equal(element.value, 'foo');
  });

  test('filling an input via element with context set', async function(assert) {
    element = buildInstrumentedElement('input');

    await setupContext(context);
    await fillIn(element, 'foo');

    assert.verifySteps(clickSteps);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.equal(element.value, 'foo');
  });

  test('filling a content editable div via element with context set', async function(assert) {
    element = buildInstrumentedElement('div');
    element.setAttribute('contenteditable', '');

    await setupContext(context);
    await fillIn(element, 'foo');

    assert.verifySteps(clickSteps);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.equal(element.innerHTML, 'foo');
  });

  test('filling an input via element without context set', async function(assert) {
    element = buildInstrumentedElement('input');

    await fillIn(element, 'foo');

    assert.verifySteps(clickSteps);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.equal(element.value, 'foo');
  });

  test('filling an input via selector with empty string', async function(assert) {
    element = buildInstrumentedElement('input');

    await setupContext(context);
    await fillIn(`#${element.id}`, '');

    assert.verifySteps(clickSteps);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.equal(element.value, '');
  });

  test('filling a select via selector with context set', async function(assert) {
    element = buildInstrumentedElement('select');

    element.innerHTML = `
<option value="value1">Value 1</option>
<option value="value2">Value 2</option>
<option value="value3">Value 3</option>
`;

    await setupContext(context);
    await fillIn(`#${element.id}`, 'value1');

    assert.verifySteps(clickSteps);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.equal(element.value, 'value1');
  });

  test('filling a select via selector with context set with a non-existing value', async function(assert) {
    element = buildInstrumentedElement('select');

    element.innerHTML = `
<option value="value1">Value 1</option>
<option value="value2">Value 2</option>
<option value="value3">Value 3</option>
`;

    await setupContext(context);
    await fillIn(`#${element.id}`, 'foo');

    assert.verifySteps(clickSteps);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.equal(element.value, '');
  });

  test('filling a multi-select via selector with context set', async function(assert) {
    element = buildInstrumentedElement('select');

    element.innerHTML = `
<option value="value1">Value 1</option>
<option value="value2">Value 2</option>
<option value="value3">Value 3</option>
`;

    element.multiple = true;

    await setupContext(context);
    await fillIn(`#${element.id}`, 'value1');

    assert.verifySteps(clickSteps);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.deepEqual(
      Array.from(element.selectedOptions).map(option => option.value),
      ['value1'],
      'selected options updated'
    );
  });

  test('filling a multi-select via selector with context set with an array', async function(assert) {
    element = buildInstrumentedElement('select');

    element.innerHTML = `
<option value="value1">Value 1</option>
<option value="value2">Value 2</option>
<option value="value3">Value 3</option>
`;

    element.multiple = true;

    await setupContext(context);
    await fillIn(`#${element.id}`, ['value1', 'value2']);

    assert.verifySteps(clickSteps);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.deepEqual(
      Array.from(element.selectedOptions).map(option => option.value),
      ['value1', 'value2'],
      'selected options updated'
    );
  });

  test('filling a single select with an array', async function(assert) {
    element = buildInstrumentedElement('select');

    element.innerHTML = `
<option value="value1">Value 1</option>
<option value="value2">Value 2</option>
<option value="value3">Value 3</option>
`;

    await setupContext(context);
    assert.rejects(
      fillIn(`#${element.id}`, ['value1']),
      /You can only provide an array of texts for multi selects./
    );
  });
});
