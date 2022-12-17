import { module, test } from 'qunit';
import { fillIn, setupContext, teardownContext } from '@ember/test-helpers';
import { buildInstrumentedElement, insertElement } from '../../helpers/events';
import { isFirefox } from '../../helpers/browser-detect';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import {
  registerHooks,
  unregisterHooks,
  buildExpectedSteps,
} from '../../helpers/register-hooks';

let clickSteps = ['focus', 'focusin', 'input', 'change'];

if (isFirefox) {
  clickSteps.push('selectionchange');
}

module('DOM Helper: fillIn', function (hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  let context, element;

  hooks.beforeEach(function () {
    context = {};
  });

  hooks.afterEach(async function () {
    element.setAttribute('data-skip-steps', true);

    if (element) {
      element.parentNode.removeChild(element);
      element = null;
    }
    if (context.owner) {
      await teardownContext(context);
    }

    document.getElementById('ember-testing').innerHTML = '';
  });

  test('it executes registered fillIn hooks', async function (assert) {
    assert.expect(11);

    element = document.createElement('input');
    insertElement(element);

    const expectedEvents = ['input', 'change'];
    const mockHooks = registerHooks(assert, 'fillIn', { expectedEvents });

    try {
      await fillIn(element, 'foo');

      const expectedSteps = buildExpectedSteps('fillIn', { expectedEvents });
      assert.verifySteps(expectedSteps);
    } finally {
      unregisterHooks(mockHooks);
    }
  });

  test('filling in a non-fillable element', async function (assert) {
    element = buildInstrumentedElement('div');

    await setupContext(context);
    assert.rejects(
      fillIn(`#${element.id}`, 'foo'),
      /`fillIn` is only usable on form controls or contenteditable elements/
    );
  });

  test('filling in a disabled element', async function (assert) {
    element = buildInstrumentedElement('input');
    element.dataset.testDisabled = '';
    element.setAttribute('disabled', true);

    await setupContext(context);

    assert.rejects(
      fillIn(`[data-test-disabled]`, 'foo'),
      new Error("Can not `fillIn` disabled '[data-test-disabled]'."),
      'renders user selector'
    );

    assert.rejects(
      fillIn(element, 'foo'),
      new Error("Can not `fillIn` disabled '[object HTMLInputElement]'."),
      'renders Element instance'
    );
  });

  test('filling in a readonly element', async function (assert) {
    element = buildInstrumentedElement('input');
    element.dataset.testDisabled = '';
    element.setAttribute('readonly', true);

    await setupContext(context);

    assert.rejects(
      fillIn(`[data-test-disabled]`, 'foo'),
      new Error("Can not `fillIn` readonly '[data-test-disabled]'.")
    );

    assert.rejects(
      fillIn(element, 'foo'),
      new Error("Can not `fillIn` readonly '[object HTMLInputElement]'."),
      'renders Element instance'
    );
  });

  test('rejects if selector is not found', async function (assert) {
    element = buildInstrumentedElement('div');

    await setupContext(context);

    assert.rejects(
      fillIn(`#foo-bar-baz-not-here-ever-bye-bye`, 'foo'),
      /Element not found when calling `fillIn\('#foo-bar-baz-not-here-ever-bye-bye'\)`/
    );
  });

  test('rejects if text to fill in is not provided', async function (assert) {
    element = buildInstrumentedElement('input');

    assert.rejects(
      fillIn(element),
      /Must provide `text` when calling `fillIn`/
    );
  });

  test('filling an input via selector without context set', async function (assert) {
    element = buildInstrumentedElement('input');

    assert.rejects(
      fillIn(`#${element.id}`, 'foo'),
      /Must setup rendering context before attempting to interact with elements/
    );
  });

  test('does not run sync', async function (assert) {
    element = buildInstrumentedElement('input');

    let promise = fillIn(element, 'foo');

    assert.verifySteps([]);

    await promise;

    assert.verifySteps(clickSteps);
    assert.strictEqual(
      document.activeElement,
      element,
      'activeElement updated'
    );
    assert.equal(element.value, 'foo');
  });

  test('filling a textarea via selector with context set', async function (assert) {
    element = buildInstrumentedElement('textarea');

    await setupContext(context);
    await fillIn(`#${element.id}`, 'foo');

    assert.verifySteps(clickSteps);
    assert.strictEqual(
      document.activeElement,
      element,
      'activeElement updated'
    );
    assert.equal(element.value, 'foo');
  });

  test('filling an input via element with context set', async function (assert) {
    element = buildInstrumentedElement('textarea');

    await setupContext(context);
    await fillIn(element, 'foo');

    assert.verifySteps(clickSteps);
    assert.strictEqual(
      document.activeElement,
      element,
      'activeElement updated'
    );
    assert.equal(element.value, 'foo');
  });

  test('filling an input via selector with context set', async function (assert) {
    element = buildInstrumentedElement('input');

    await setupContext(context);
    await fillIn(`#${element.id}`, 'foo');

    assert.verifySteps(clickSteps);
    assert.strictEqual(
      document.activeElement,
      element,
      'activeElement updated'
    );
    assert.equal(element.value, 'foo');
  });

  test('filling an input via element with context set', async function (assert) {
    element = buildInstrumentedElement('input');

    await setupContext(context);
    await fillIn(element, 'foo');

    assert.verifySteps(clickSteps);
    assert.strictEqual(
      document.activeElement,
      element,
      'activeElement updated'
    );
    assert.equal(element.value, 'foo');
  });

  test('filling a content editable div via element with context set', async function (assert) {
    element = buildInstrumentedElement('div');
    element.setAttribute('contenteditable', '');

    await setupContext(context);
    await fillIn(element, 'foo');

    // For this specific case, Firefox does not emit `selectionchange`.
    assert.verifySteps(clickSteps.filter((s) => s !== 'selectionchange'));
    assert.strictEqual(
      document.activeElement,
      element,
      'activeElement updated'
    );
    assert.equal(element.innerHTML, 'foo');
  });

  test('filling an input via element without context set', async function (assert) {
    element = buildInstrumentedElement('input');

    await fillIn(element, 'foo');

    assert.verifySteps(clickSteps);
    assert.strictEqual(
      document.activeElement,
      element,
      'activeElement updated'
    );
    assert.equal(element.value, 'foo');
  });

  test('filling an input via selector with empty string', async function (assert) {
    element = buildInstrumentedElement('input');

    await setupContext(context);
    await fillIn(`#${element.id}`, '');

    // For this specific case, Firefox does not emit `selectionchange`.
    assert.verifySteps(clickSteps.filter((s) => s !== 'selectionchange'));
    assert.strictEqual(
      document.activeElement,
      element,
      'activeElement updated'
    );
    assert.equal(element.value, '');
  });

  test('filling an input with a maxlength with suitable value', async function (assert) {
    element = buildInstrumentedElement('input');
    const maxLengthString = 'f';
    element.setAttribute('maxlength', maxLengthString.length);

    await setupContext(context);

    await fillIn(element, maxLengthString);

    assert.verifySteps(clickSteps);
    assert.equal(
      element.value,
      maxLengthString,
      `fillIn respects input attribute [maxlength=${maxLengthString.length}]`
    );
  });

  test('filling an input with a maxlength with too long value', async function (assert) {
    element = buildInstrumentedElement('input');
    const maxLengthString = 'f';
    const tooLongString = maxLengthString.concat('oo');
    element.setAttribute('maxlength', maxLengthString.length);

    await setupContext(context);

    assert.rejects(
      fillIn(element, tooLongString),
      new Error(
        "Can not `fillIn` with text: 'foo' that exceeds maxlength: '1'."
      )
    );
  });

  test('filling in a non-constrained input type with maxlength', async function (assert) {
    element = buildInstrumentedElement('input');
    const maxLengthString = '1';
    const tooLongString = maxLengthString.concat('23');
    element.setAttribute('type', 'number');
    element.setAttribute('maxlength', maxLengthString.length);
    await setupContext(context);

    await fillIn(element, tooLongString);

    assert.verifySteps(clickSteps);
    assert.equal(
      element.value,
      tooLongString,
      'fillIn does not reject non-constrained input types'
    );
  });

  test('filling a textarea with a maxlength with suitable value', async function (assert) {
    element = buildInstrumentedElement('textarea');
    const maxLengthString = 'f';
    element.setAttribute('maxlength', maxLengthString.length);

    await setupContext(context);

    await fillIn(element, maxLengthString);

    assert.verifySteps(clickSteps);
    assert.equal(
      element.value,
      maxLengthString,
      `fillIn respects textarea attribute [maxlength=${maxLengthString.length}]`
    );
  });

  test('filling a textarea with a maxlength with too long value', async function (assert) {
    element = buildInstrumentedElement('textarea');
    const maxLengthString = 'f';
    const tooLongString = maxLengthString.concat('oo');
    element.setAttribute('maxlength', maxLengthString.length);

    await setupContext(context);

    assert.rejects(
      fillIn(element, tooLongString),
      new Error(
        "Can not `fillIn` with text: 'foo' that exceeds maxlength: '1'."
      )
    );
  });
});
