import { module, test } from 'qunit';
import { typeIn, setupContext, teardownContext } from '@ember/test-helpers';
import { buildInstrumentedElement, insertElement } from '../../helpers/events';
import { isFirefox } from '../../helpers/browser-detect';
import { debounce } from '@ember/runloop';
import { Promise } from 'rsvp';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import {
  registerHooks,
  unregisterHooks,
  buildExpectedSteps,
} from '../../helpers/register-hooks';

/*
 * Event order based on https://jsbin.com/zitazuxabe/edit?html,js,console,output
 */

let expectedEvents = [
  'focus',
  'focusin',
  'keydown',
  'keypress',
  'input',
  'keyup',
  'keydown',
  'keypress',
  'input',
  'keyup',
  'keydown',
  'keypress',
  'input',
  'keyup',
  'change',
];

if (isFirefox) {
  expectedEvents = [
    'focus',
    'focusin',
    'keydown',
    'keypress',
    'input',
    'keyup',
    'selectionchange',
    'keydown',
    'keypress',
    'input',
    'keyup',
    'selectionchange',
    'keydown',
    'keypress',
    'input',
    'keyup',
    'change',
    'selectionchange',
  ];
}

module('DOM Helper: typeIn', function (hooks) {
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

  test('it executes registered typeIn hooks', async function (assert) {
    assert.expect(55);

    element = document.createElement('input');
    insertElement(element);

    const expectedEvents = [
      'keydown',
      'keypress',
      'input',
      'keyup',
      'keydown',
      'keypress',
      'input',
      'keyup',
      'keydown',
      'keypress',
      'input',
      'keyup',
      'change',
    ];
    const mockHooks = registerHooks(assert, 'typeIn', { expectedEvents });

    try {
      await typeIn(element, 'foo');

      const expectedSteps = buildExpectedSteps('typeIn', { expectedEvents });
      assert.verifySteps(expectedSteps);
    } finally {
      unregisterHooks(mockHooks);
    }
  });

  test('typing in an input', async function (assert) {
    element = buildInstrumentedElement('input');
    await typeIn(element, 'foo');

    assert.verifySteps(expectedEvents);
    assert.strictEqual(
      document.activeElement,
      element,
      'activeElement updated'
    );
    assert.equal(element.value, 'foo');
  });

  test('it triggers key events with correct arguments', async function (assert) {
    element = buildInstrumentedElement('input', ['key', 'shiftKey']);
    await typeIn(element, 'F o');

    let chars = ['F', ' ', 'o'];
    let shiftKeys = [true, false, false];
    let expectedEventsWithArguments = expectedEvents.map((eventName) => {
      // Only key events get the key arguments
      if (!['keydown', 'keypress', 'keyup'].includes(eventName)) {
        return `${eventName} undefined undefined`;
      }
      // After each keyup, the next character comes up
      let char = eventName === 'keyup' ? chars.shift() : chars[0];
      let shiftKey = eventName === 'keyup' ? shiftKeys.shift() : shiftKeys[0];

      return `${eventName} ${char.toUpperCase()} ${shiftKey}`;
    });

    assert.verifySteps(expectedEventsWithArguments);
  });

  test('typing in an input with a delay', async function (assert) {
    element = buildInstrumentedElement('input');
    await typeIn(element, 'foo', { delay: 150 });

    assert.verifySteps(expectedEvents);
    assert.strictEqual(
      document.activeElement,
      element,
      'activeElement updated'
    );
    assert.equal(element.value, 'foo');
  });

  test('typing in a textarea', async function (assert) {
    element = buildInstrumentedElement('textarea');
    await typeIn(element, 'foo');

    assert.verifySteps(expectedEvents);
    assert.strictEqual(
      document.activeElement,
      element,
      'activeElement updated'
    );
    assert.equal(element.value, 'foo');
  });

  test('typing in a contenteditable element', async function (assert) {
    element = buildInstrumentedElement('div');
    element.setAttribute('contenteditable', 'true');
    await typeIn(element, 'foo');

    // For this specific case, Firefox does not emit `selectionchange`.
    assert.verifySteps(expectedEvents.filter((s) => s !== 'selectionchange'));

    assert.strictEqual(
      document.activeElement,
      element,
      'activeElement updated'
    );
    assert.equal(element.innerHTML, 'foo');
  });

  test('typing in a non-typeable element', async function (assert) {
    element = buildInstrumentedElement('div');

    await setupContext(context);
    assert.rejects(
      typeIn(`#${element.id}`, 'foo'),
      /`typeIn` is only usable on form controls or contenteditable elements/
    );
  });

  test('typing in a disabled element', async function (assert) {
    element = buildInstrumentedElement('input');
    element.dataset.testDisabled = '';
    element.setAttribute('disabled', '');

    await setupContext(context);
    assert.rejects(
      typeIn(`[data-test-disabled]`, 'foo'),
      new Error("Can not `typeIn` disabled '[data-test-disabled]'.")
    );

    assert.rejects(
      typeIn(element, 'foo'),
      new Error("Can not `typeIn` disabled '[object HTMLInputElement]'.")
    );
  });

  test('typing in a readonly element', async function (assert) {
    element = buildInstrumentedElement('input');
    element.dataset.testDisabled = '';
    element.setAttribute('readonly', '');

    await setupContext(context);
    assert.rejects(
      typeIn(`[data-test-disabled]`, 'foo'),
      new Error("Can not `typeIn` readonly '[data-test-disabled]'.")
    );

    assert.rejects(
      typeIn(element, 'foo'),
      new Error("Can not `typeIn` readonly '[object HTMLInputElement]'.")
    );
  });

  test('rejects if selector is not found', async function (assert) {
    element = buildInstrumentedElement('div');

    await setupContext(context);

    assert.rejects(
      typeIn(`#foo-bar-baz-not-here-ever-bye-bye`, 'foo'),
      /Element not found when calling `typeIn\('#foo-bar-baz-not-here-ever-bye-bye'\)`/
    );
  });

  test('rejects if text to fill in is not provided', async function (assert) {
    element = buildInstrumentedElement('input');

    assert.rejects(
      typeIn(element),
      /Must provide `text` when calling `typeIn`/
    );
  });

  test('does not run sync', async function (assert) {
    element = buildInstrumentedElement('input');

    let promise = typeIn(element, 'foo');

    assert.verifySteps([]);

    await promise;

    assert.verifySteps(expectedEvents);
    assert.strictEqual(
      document.activeElement,
      element,
      'activeElement updated'
    );
    assert.equal(element.value, 'foo');
  });

  test('does not wait for other promises to settle', async function (assert) {
    element = buildInstrumentedElement('input');

    let runCount = 0;
    let onInput = function () {
      return Promise.resolve().then(() => runCount++);
    };

    element.oninput = function () {
      // debounce 2 seconds for easy visualization in test
      debounce(onInput, 2000);
    };

    await typeIn(element, 'foo');

    assert.verifySteps(expectedEvents);
    assert.equal(runCount, 1, 'debounced function only called once');
  });

  test('typing in an input with a maxlength with suitable value', async function (assert) {
    element = buildInstrumentedElement('input');
    const maxLengthString = 'foo';
    element.setAttribute('maxlength', maxLengthString.length);

    await setupContext(context);

    await typeIn(element, maxLengthString);

    assert.verifySteps(expectedEvents);
    assert.equal(
      element.value,
      maxLengthString,
      `typeIn respects input attribute [maxlength=${maxLengthString.length}]`
    );
  });

  test('typing in an input with a maxlength with too long value', async function (assert) {
    element = buildInstrumentedElement('input');
    const maxLengthString = 'f';
    const tooLongString = maxLengthString.concat('o');
    element.setAttribute('maxlength', maxLengthString.length);

    await setupContext(context);

    await assert.rejects(
      typeIn(element, tooLongString).finally(() => {
        // should throw before the second input event (or second keyup for IE)
        const expectedNumberOfSteps = isFirefox ? 9 : 8;
        assert.verifySteps(expectedEvents.slice(0, expectedNumberOfSteps));
      }),
      new Error("Can not `typeIn` with text: 'fo' that exceeds maxlength: '1'.")
    );
  });

  test('typing in a non-constrained input type with maxlength', async function (assert) {
    element = buildInstrumentedElement('input');
    const maxLengthString = '1';
    const tooLongString = maxLengthString.concat('23');
    element.setAttribute('type', 'number');
    element.setAttribute('maxlength', maxLengthString.length);
    await setupContext(context);

    await typeIn(element, tooLongString);

    assert.verifySteps(expectedEvents);
    assert.equal(
      element.value,
      tooLongString,
      'typeIn does not reject non-constrained input types'
    );
  });

  test('typing in a textarea with a maxlength with suitable value', async function (assert) {
    element = buildInstrumentedElement('textarea');
    const maxLengthString = 'foo';
    element.setAttribute('maxlength', maxLengthString.length);

    await setupContext(context);

    await typeIn(element, maxLengthString);

    assert.verifySteps(expectedEvents);
    assert.equal(
      element.value,
      maxLengthString,
      `typeIn respects textarea attribute [maxlength=${maxLengthString.length}]`
    );
  });

  test('typing in a textarea with a maxlength with too long value', async function (assert) {
    element = buildInstrumentedElement('textarea');
    const maxLengthString = 'f';
    const tooLongString = maxLengthString.concat('o');
    element.setAttribute('maxlength', maxLengthString.length);

    await setupContext(context);

    await assert.rejects(
      typeIn(element, tooLongString).finally(() => {
        // should throw before the second input event (or second keyup for IE)
        const expectedNumberOfSteps = isFirefox ? 9 : 8;
        assert.verifySteps(expectedEvents.slice(0, expectedNumberOfSteps));
      }),
      new Error("Can not `typeIn` with text: 'fo' that exceeds maxlength: '1'.")
    );
  });
});
