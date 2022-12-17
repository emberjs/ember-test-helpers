import { module, test } from 'qunit';
import { click, setupContext, teardownContext } from '@ember/test-helpers';
import {
  buildInstrumentedElement,
  instrumentElement,
  insertElement,
} from '../../helpers/events';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import {
  registerHooks,
  unregisterHooks,
  buildExpectedSteps,
} from '../../helpers/register-hooks';

module('DOM Helper: click', function (hooks) {
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
    }
    if (context.owner) {
      await teardownContext(context);
    }

    document.getElementById('ember-testing').innerHTML = '';
  });

  test('it executes registered click hooks', async function (assert) {
    assert.expect(15);

    element = document.createElement('div');
    insertElement(element);

    const expectedEvents = ['mousedown', 'mouseup', 'click'];
    const mockHooks = registerHooks(assert, 'click', { expectedEvents });

    try {
      await click(element);

      const expectedSteps = buildExpectedSteps('click', { expectedEvents });
      assert.verifySteps(expectedSteps);
    } finally {
      unregisterHooks(mockHooks);
    }
  });

  module('non-focusable element types', function () {
    test('clicking a div via selector with context set', async function (assert) {
      element = buildInstrumentedElement('div');

      await setupContext(context);
      await click(`#${element.id}`);

      assert.verifySteps(['mousedown', 'mouseup', 'click']);
    });

    test('clicking a div via element with context set', async function (assert) {
      element = buildInstrumentedElement('div');

      await setupContext(context);
      await click(element);

      assert.verifySteps(['mousedown', 'mouseup', 'click']);
    });

    test('clicking a div via element without context set', async function (assert) {
      element = buildInstrumentedElement('div');

      await click(element);

      assert.verifySteps(['mousedown', 'mouseup', 'click']);
    });

    test('does not run sync', async function (assert) {
      element = buildInstrumentedElement('div');

      let promise = click(element);

      assert.verifySteps([]);

      await promise;

      assert.verifySteps(['mousedown', 'mouseup', 'click']);
    });

    test('rejects if selector is not found', async function (assert) {
      element = buildInstrumentedElement('div');

      await setupContext(context);

      assert.rejects(
        click(`#foo-bar-baz-not-here-ever-bye-bye`),
        /Element not found when calling `click\('#foo-bar-baz-not-here-ever-bye-bye'\)`/
      );
    });

    test('clicking a div via selector without context set', function (assert) {
      element = buildInstrumentedElement('div');

      assert.rejects(
        click(`#${element.id}`),
        /Must setup rendering context before attempting to interact with elements/
      );
    });

    test('clicking a disabled div still clicks', async function (assert) {
      element = buildInstrumentedElement('div');
      element.setAttribute('disabled', true);

      await click(element);

      assert.verifySteps(['mousedown', 'mouseup', 'click']);
    });

    test('clicking passes default options through to mouse events', async function (assert) {
      element = buildInstrumentedElement('div', ['buttons', 'button']);

      await click(element);

      assert.verifySteps(['mousedown 1 0', 'mouseup 1 0', 'click 1 0']);
    });

    test('clicking passes options through to mouse events and merges with default options', async function (assert) {
      element = buildInstrumentedElement('div', [
        'clientX',
        'clientY',
        'button',
        'buttons',
      ]);

      await click(element, { clientX: 13, clientY: 17, button: 2 });

      assert.verifySteps([
        'mousedown 13 17 2 1',
        'mouseup 13 17 2 1',
        'click 13 17 2 1',
      ]);
    });

    test('clicking accepts modifiers', async function (assert) {
      element = buildInstrumentedElement('div', [
        'clientX',
        'clientY',
        'button',
      ]);
      let handler = (e) => {
        assert.equal(e.altKey, true);
      };
      element.addEventListener('click', handler);
      await click(element, { clientX: 13, clientY: 17, altKey: true });
      assert.verifySteps([
        'mousedown 13 17 0',
        'mouseup 13 17 0',
        'click 13 17 0',
      ]);
      element.removeEventListener('click', handler);
    });

    test('clicking a div has window set as view by default', async function (assert) {
      element = buildInstrumentedElement('div', ['view']);

      await setupContext(context);
      await click(element);

      assert.verifySteps([
        'mousedown [object Window]',
        'mouseup [object Window]',
        'click [object Window]',
      ]);
    });
  });

  module('focusable element types', function () {
    let clickSteps = ['mousedown', 'focus', 'focusin', 'mouseup', 'click'];

    test('clicking a input via selector with context set', async function (assert) {
      element = buildInstrumentedElement('input');

      await setupContext(context);
      await click(`#${element.id}`);

      assert.verifySteps(clickSteps);
      assert.strictEqual(
        document.activeElement,
        element,
        'activeElement updated'
      );
    });

    test('clicking a input via element with context set', async function (assert) {
      element = buildInstrumentedElement('input');

      await setupContext(context);
      await click(element);

      assert.verifySteps(clickSteps);
      assert.strictEqual(
        document.activeElement,
        element,
        'activeElement updated'
      );
    });

    test('clicking a input via element without context set', async function (assert) {
      element = buildInstrumentedElement('input');

      await click(element);

      assert.verifySteps(clickSteps);
      assert.strictEqual(
        document.activeElement,
        element,
        'activeElement updated'
      );
    });

    test('clicking a input via selector without context set', function (assert) {
      element = buildInstrumentedElement('input');

      assert.rejects(
        click(`#${element.id}`),
        /Must setup rendering context before attempting to interact with elements/
      );
    });

    test('clicking a disabled form control', async function (assert) {
      element = buildInstrumentedElement('input');
      element.setAttribute('disabled', true);

      await setupContext(context);
      assert.rejects(
        click(`#${element.id}`),
        new Error('Can not `click` disabled [object HTMLInputElement]')
      );
    });

    test('clicking an un-focusable element inside a focus-able one', async function (assert) {
      element = buildInstrumentedElement('button');
      let child = document.createElement('span');
      element.append(child);

      await click(child);

      assert.verifySteps(clickSteps);
      assert.strictEqual(
        document.activeElement,
        element,
        'activeElement updated'
      );
    });
  });

  module('elements in different realms', function () {
    test('clicking an element in a different realm', async function (assert) {
      element = document.createElement('iframe');

      insertElement(element);

      let iframeDocument = element.contentDocument;
      let iframeElement = iframeDocument.createElement('div');

      instrumentElement(iframeElement);

      await click(iframeElement);

      assert.verifySteps(['mousedown', 'mouseup', 'click']);
    });
  });

  module('focusable and non-focusable elements interaction', function () {
    test('clicking on non-focusable element triggers blur on active element', async function (assert) {
      element = document.createElement('div');

      insertElement(element);

      const focusableElement = buildInstrumentedElement('input');

      await click(focusableElement);
      await click(element);

      assert.verifySteps([
        'mousedown',
        'focus',
        'focusin',
        'mouseup',
        'click',
        'blur',
        'focusout',
      ]);
    });

    test('clicking on non-focusable element inside active element does not trigger blur on active element', async function (assert) {
      element = buildInstrumentedElement('button');
      let child = document.createElement('div');
      element.append(child);

      insertElement(element);

      await click(element);
      await click(child);

      assert.verifySteps([
        'mousedown',
        'focus',
        'focusin',
        'mouseup',
        'click',
        'mousedown',
        'mouseup',
        'click',
      ]);
    });

    test('clicking on focusable element triggers blur on active element', async function (assert) {
      element = document.createElement('input');

      insertElement(element);

      const focusableElement = buildInstrumentedElement('input');

      await click(focusableElement);
      await click(element);

      assert.verifySteps([
        'mousedown',
        'focus',
        'focusin',
        'mouseup',
        'click',
        'blur',
        'focusout',
      ]);
    });

    test('clicking on non-focusable element does not trigger blur on non-focusable active element', async function (assert) {
      element = document.createElement('div');

      insertElement(element);

      const nonFocusableElement = buildInstrumentedElement('div');

      await click(nonFocusableElement);
      await click(element);

      assert.verifySteps(['mousedown', 'mouseup', 'click']);
    });

    test('preventDefault() on the mousedown event prevents triggering focus/blur events', async function (assert) {
      element = document.createElement('input');

      let preventDefault = (e) => e.preventDefault();
      element.addEventListener('mousedown', preventDefault);

      insertElement(element);

      const focusableElement = buildInstrumentedElement('input');
      focusableElement.addEventListener('blur', () => {
        console.log('blur');
      });

      await click(focusableElement);
      await click(element);

      assert.verifySteps(['mousedown', 'focus', 'focusin', 'mouseup', 'click']);

      element.removeEventListener('mousedown', preventDefault);
      await click(element);

      assert.verifySteps(['blur', 'focusout']);
    });
  });
});

module('DOM Helper: click with window', function () {
  test('clicking window without context set fires the given event type', async function (assert) {
    let listener = (e) => {
      assert.step('click');
      assert.ok(e instanceof Event, `click listener receives a native event`);
    };
    window.addEventListener('click', listener);

    await click(window, 'click');

    assert.verifySteps(['click']);

    window.removeEventListener('click', listener);
  });
});
