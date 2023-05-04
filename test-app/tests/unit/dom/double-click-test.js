import { module, test } from 'qunit';
import {
  doubleClick,
  setupContext,
  teardownContext,
} from '@ember/test-helpers';
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

const expectedEvents = [
  'mousedown',
  'mouseup',
  'click',
  'mousedown',
  'mouseup',
  'click',
  'dblclick',
];

module('DOM Helper: doubleClick', function (hooks) {
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

  test('it executes registered doubleClick hooks', async function (assert) {
    assert.expect(31);

    element = document.createElement('div');
    insertElement(element);

    const mockHooks = registerHooks(assert, 'doubleClick', { expectedEvents });

    try {
      await doubleClick(element);

      const expectedSteps = buildExpectedSteps('doubleClick', {
        expectedEvents,
      });
      assert.verifySteps(expectedSteps);
    } finally {
      unregisterHooks(mockHooks);
    }
  });

  module('non-focusable element types', function () {
    test('double-clicking a div via selector with context set', async function (assert) {
      element = buildInstrumentedElement('div');

      await setupContext(context);
      await doubleClick(`#${element.id}`);

      assert.verifySteps([
        'mousedown',
        'mouseup',
        'click',
        'mousedown',
        'mouseup',
        'click',
        'dblclick',
      ]);
    });

    test('double-clicking a div via element with context set', async function (assert) {
      element = buildInstrumentedElement('div');

      await setupContext(context);
      await doubleClick(element);

      assert.verifySteps([
        'mousedown',
        'mouseup',
        'click',
        'mousedown',
        'mouseup',
        'click',
        'dblclick',
      ]);
    });

    test('double-clicking a div via element without context set', async function (assert) {
      element = buildInstrumentedElement('div');

      await doubleClick(element);

      assert.verifySteps([
        'mousedown',
        'mouseup',
        'click',
        'mousedown',
        'mouseup',
        'click',
        'dblclick',
      ]);
    });

    test('does not run sync', async function (assert) {
      element = buildInstrumentedElement('div');

      let promise = doubleClick(element);

      assert.verifySteps([]);

      await promise;

      assert.verifySteps([
        'mousedown',
        'mouseup',
        'click',
        'mousedown',
        'mouseup',
        'click',
        'dblclick',
      ]);
    });

    test('rejects if selector is not found', async function (assert) {
      element = buildInstrumentedElement('div');

      await setupContext(context);

      assert.rejects(
        doubleClick(`#foo-bar-baz-not-here-ever-bye-bye`),
        /Element not found when calling `doubleClick\('#foo-bar-baz-not-here-ever-bye-bye'\)`/
      );
    });

    test('rejects for disabled form control', async function (assert) {
      element = buildInstrumentedElement('select');
      element.setAttribute('disabled', true);

      await setupContext(context);
      assert.rejects(
        doubleClick(element),
        new Error('Can not `doubleClick` disabled [object HTMLSelectElement]')
      );
    });

    test('double-clicking a div via selector without context set', function (assert) {
      element = buildInstrumentedElement('div');

      assert.rejects(
        doubleClick(`#${element.id}`),
        /Must setup rendering context before attempting to interact with elements/
      );
    });

    test('double-clicking passes default options through to mouse events', async function (assert) {
      element = buildInstrumentedElement('div', ['button', 'buttons']);

      await doubleClick(element);

      assert.verifySteps([
        'mousedown 0 1',
        'mouseup 0 1',
        'click 0 1',
        'mousedown 0 1',
        'mouseup 0 1',
        'click 0 1',
        'dblclick 0 1',
      ]);
    });

    test('double-clicking passes options through to mouse events and merges with default options', async function (assert) {
      element = buildInstrumentedElement('div', [
        'clientX',
        'clientY',
        'button',
        'buttons',
      ]);

      await doubleClick(element, { clientX: 13, clientY: 17, button: 1 });

      assert.verifySteps([
        'mousedown 13 17 1 1',
        'mouseup 13 17 1 1',
        'click 13 17 1 1',
        'mousedown 13 17 1 1',
        'mouseup 13 17 1 1',
        'click 13 17 1 1',
        'dblclick 13 17 1 1',
      ]);
    });
  });

  module('focusable element types', function () {
    let clickSteps = [
      'mousedown',
      'focus',
      'focusin',
      'mouseup',
      'click',
      'mousedown',
      'mouseup',
      'click',
      'dblclick',
    ];

    test('double-clicking a input via selector with context set', async function (assert) {
      element = buildInstrumentedElement('input');

      await setupContext(context);
      await doubleClick(`#${element.id}`);

      assert.verifySteps(clickSteps);
      assert.strictEqual(
        document.activeElement,
        element,
        'activeElement updated'
      );
    });

    test('double-clicking a input via element with context set', async function (assert) {
      element = buildInstrumentedElement('input');

      await setupContext(context);
      await doubleClick(element);

      assert.verifySteps(clickSteps);
      assert.strictEqual(
        document.activeElement,
        element,
        'activeElement updated'
      );
    });

    test('double-clicking a input via element without context set', async function (assert) {
      element = buildInstrumentedElement('input');

      await doubleClick(element);

      assert.verifySteps(clickSteps);
      assert.strictEqual(
        document.activeElement,
        element,
        'activeElement updated'
      );
    });

    test('double-clicking a input via selector without context set', function (assert) {
      element = buildInstrumentedElement('input');

      assert.rejects(
        doubleClick(`#${element.id}`),
        /Must setup rendering context before attempting to interact with elements/
      );
    });

    test('double-clicking an un-focusable element inside a focus-able one', async function (assert) {
      element = buildInstrumentedElement('button');
      let child = document.createElement('span');
      element.append(child);

      await doubleClick(child);

      assert.verifySteps(clickSteps);
      assert.strictEqual(
        document.activeElement,
        element,
        'activeElement updated'
      );
    });
  });

  module('elements in different realms', function () {
    test('double-clicking an element in a different realm', async function (assert) {
      element = document.createElement('iframe');

      insertElement(element);

      let iframeDocument = element.contentDocument;
      let iframeElement = iframeDocument.createElement('div');

      instrumentElement(iframeElement);

      await doubleClick(iframeElement);

      assert.verifySteps([
        'mousedown',
        'mouseup',
        'click',
        'mousedown',
        'mouseup',
        'click',
        'dblclick',
      ]);
    });
  });

  module('focusable and non-focusable elements interaction', function () {
    test('double-clicking on non-focusable element triggers blur on active element', async function (assert) {
      element = document.createElement('div');

      insertElement(element);

      const focusableElement = buildInstrumentedElement('input');

      await doubleClick(focusableElement);
      await doubleClick(element);

      assert.verifySteps([
        'mousedown',
        'focus',
        'focusin',
        'mouseup',
        'click',
        'mousedown',
        'mouseup',
        'click',
        'dblclick',
        'blur',
        'focusout',
      ]);
    });

    test('double-clicking on non-focusable element inside active element does not trigger blur on active element', async function (assert) {
      element = buildInstrumentedElement('button');
      let child = document.createElement('div');
      element.append(child);

      insertElement(element);

      await doubleClick(element);
      await doubleClick(child);

      assert.verifySteps([
        'mousedown',
        'focus',
        'focusin',
        'mouseup',
        'click',
        'mousedown',
        'mouseup',
        'click',
        'dblclick',
        'mousedown',
        'mouseup',
        'click',
        'mousedown',
        'mouseup',
        'click',
        'dblclick',
      ]);
    });

    test('double-clicking on focusable element triggers blur on active element', async function (assert) {
      element = document.createElement('input');

      insertElement(element);

      const focusableElement = buildInstrumentedElement('input');

      await doubleClick(focusableElement);
      await doubleClick(element);

      assert.verifySteps([
        'mousedown',
        'focus',
        'focusin',
        'mouseup',
        'click',
        'mousedown',
        'mouseup',
        'click',
        'dblclick',
        'blur',
        'focusout',
      ]);
    });

    test('double-clicking on non-focusable element does not trigger blur on non-focusable active element', async function (assert) {
      element = document.createElement('div');

      insertElement(element);

      const nonFocusableElement = buildInstrumentedElement('div');

      await doubleClick(nonFocusableElement);
      await doubleClick(element);

      assert.verifySteps([
        'mousedown',
        'mouseup',
        'click',
        'mousedown',
        'mouseup',
        'click',
        'dblclick',
      ]);
    });

    test('preventDefault() on the mousedown event prevents triggering focus/blur events', async function (assert) {
      element = document.createElement('input');

      let preventDefault = (e) => e.preventDefault();
      element.addEventListener('mousedown', preventDefault);

      insertElement(element);

      const focusableElement = buildInstrumentedElement('input');

      await doubleClick(focusableElement);
      await doubleClick(element);

      assert.verifySteps([
        'mousedown',
        'focus',
        'focusin',
        'mouseup',
        'click',
        'mousedown',
        'mouseup',
        'click',
        'dblclick',
      ]);

      element.removeEventListener('mousedown', preventDefault);
      await doubleClick(element);

      assert.verifySteps(['blur', 'focusout']);
    });
  });
});

module('DOM Helper: doubleClick with window', function () {
  test('double clicking window without context set fires the given event type', async function (assert) {
    let listener = (e) => {
      assert.step('click');
      assert.ok(e instanceof Event, `click listener receives a native event`);
    };
    window.addEventListener('click', listener);

    await doubleClick(window, 'click');

    assert.verifySteps(['click', 'click']);

    window.removeEventListener('click', listener);
  });
});
