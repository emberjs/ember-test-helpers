import { module, test } from 'qunit';
import { fillIn, setContext, unsetContext } from '@ember/test-helpers';
import { buildInstrumentedElement } from '../../helpers/events';

module('DOM Helper: fillIn', function(hooks) {
  let context, element;

  hooks.beforeEach(function() {
    // used to simulate how `setupRenderingTest` (and soon `setupApplicationTest`)
    // set context.element to the rootElement
    context = {
      element: document.querySelector('#qunit-fixture'),
    };
  });

  hooks.afterEach(function() {
    if (element) {
      element.parentNode.removeChild(element);
    }
    unsetContext();
  });

  test('filling in a non-fillable element', async function(assert) {
    element = buildInstrumentedElement('div');

    setContext(context);
    assert.rejects(() => {
      return fillIn(`#${element.id}`, 'foo');
    }, /`fillIn` is only usable on form controls or contenteditable elements/);
  });

  test('rejects if selector is not found', async function(assert) {
    element = buildInstrumentedElement('div');

    assert.rejects(() => {
      setContext(context);
      return fillIn(`#foo-bar-baz-not-here-ever-bye-bye`, 'foo');
    }, /Element not found when calling `fillIn\('#foo-bar-baz-not-here-ever-bye-bye'\)`/);
  });

  test('rejects if text to fill in is not provided', async function(assert) {
    element = buildInstrumentedElement('input');

    assert.rejects(() => {
      return fillIn(element);
    }, /Must provide `text` when calling `fillIn`/);
  });

  test('filling an input via selector without context set', async function(assert) {
    element = buildInstrumentedElement('input');
    let errorThrown;

    try {
      await fillIn(`#${element.id}`, 'foo');
    } catch (error) {
      errorThrown = error;
    }

    assert.equal(
      errorThrown.message,
      'Must setup rendering context before attempting to interact with elements.',
      'valid error was thrown'
    );
  });

  test('does not run sync', async function(assert) {
    element = buildInstrumentedElement('input');

    let promise = fillIn(element, 'foo');

    assert.verifySteps([]);

    await promise;

    assert.verifySteps(['focus', 'focusin', 'input', 'change']);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.equal(element.value, 'foo');
  });

  test('filling a textarea via selector with context set', async function(assert) {
    element = buildInstrumentedElement('textarea');

    setContext(context);
    await fillIn(`#${element.id}`, 'foo');

    assert.verifySteps(['focus', 'focusin', 'input', 'change']);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.equal(element.value, 'foo');
  });

  test('filling an input via element with context set', async function(assert) {
    element = buildInstrumentedElement('textarea');

    setContext(context);
    await fillIn(element, 'foo');

    assert.verifySteps(['focus', 'focusin', 'input', 'change']);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.equal(element.value, 'foo');
  });

  test('filling an input via selector with context set', async function(assert) {
    element = buildInstrumentedElement('input');

    setContext(context);
    await fillIn(`#${element.id}`, 'foo');

    assert.verifySteps(['focus', 'focusin', 'input', 'change']);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.equal(element.value, 'foo');
  });

  test('filling an input via element with context set', async function(assert) {
    element = buildInstrumentedElement('input');

    setContext(context);
    await fillIn(element, 'foo');

    assert.verifySteps(['focus', 'focusin', 'input', 'change']);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.equal(element.value, 'foo');
  });

  test('filling a content editable div via element with context set', async function(assert) {
    element = buildInstrumentedElement('div');
    element.setAttribute('contenteditable', '');

    setContext(context);
    await fillIn(element, 'foo');

    assert.verifySteps(['focus', 'focusin', 'input', 'change']);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.equal(element.innerHTML, 'foo');
  });

  test('filling an input via element without context set', async function(assert) {
    element = buildInstrumentedElement('input');

    await fillIn(element, 'foo');

    assert.verifySteps(['focus', 'focusin', 'input', 'change']);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
    assert.equal(element.value, 'foo');
  });
});
