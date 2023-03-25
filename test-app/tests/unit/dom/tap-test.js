import { module, test } from 'qunit';
import { tap, setupContext, teardownContext } from '@ember/test-helpers';
import { buildInstrumentedElement, insertElement } from '../../helpers/events';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import {
  registerHooks,
  unregisterHooks,
  buildExpectedSteps,
} from '../../helpers/register-hooks';

module('DOM Helper: tap', function (hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  let context, element;

  hooks.beforeEach(function () {
    // used to simulate how `setupRenderingTest` (and soon `setupApplicationTest`)
    // set context.element to the rootElement
    context = {
      element: document.querySelector('#qunit-fixture'),
    };
  });

  hooks.afterEach(async function () {
    element.setAttribute('data-skip-steps', true);

    if (element) {
      element.parentNode.removeChild(element);
      element = null;
    }
    // only teardown if setupContext was called
    if (context.owner) {
      await teardownContext(context);
    }
    document.getElementById('ember-testing').innerHTML = '';
  });

  test('it executes registered tap hooks', async function (assert) {
    assert.expect(23);

    element = document.createElement('div');
    insertElement(element);

    const expectedEvents = [
      'touchstart',
      'touchend',
      'mousedown',
      'mouseup',
      'click',
    ];
    const mockHooks = registerHooks(assert, 'tap', { expectedEvents });

    try {
      await tap(element);

      const expectedSteps = buildExpectedSteps('tap', { expectedEvents });
      assert.verifySteps(expectedSteps);
    } finally {
      unregisterHooks(mockHooks);
    }
  });

  module('non-focusable element types', function () {
    test('taping a div via selector with context set', async function (assert) {
      element = buildInstrumentedElement('div');

      await setupContext(context);
      await tap(`#${element.id}`);

      assert.verifySteps([
        'touchstart',
        'touchend',
        'mousedown',
        'mouseup',
        'click',
      ]);
    });

    test('tapping a div via element with context set', async function (assert) {
      element = buildInstrumentedElement('div');

      await setupContext(context);
      await tap(element);

      assert.verifySteps([
        'touchstart',
        'touchend',
        'mousedown',
        'mouseup',
        'click',
      ]);
    });

    test('tapping a div via element without context set', async function (assert) {
      element = buildInstrumentedElement('div');

      await tap(element);

      assert.verifySteps([
        'touchstart',
        'touchend',
        'mousedown',
        'mouseup',
        'click',
      ]);
    });

    test('tapping passes options through to mouse events', async function (assert) {
      element = buildInstrumentedElement('div', [
        'clientX',
        'clientY',
        'button',
      ]);

      await tap(element, { clientX: 13, clientY: 17, button: 1 });

      assert.verifySteps([
        'touchstart 13 17 1',
        'touchend 13 17 1',
        'mousedown 13 17 1',
        'mouseup 13 17 1',
        'click 13 17 1',
      ]);
    });

    test('does not run sync', async function (assert) {
      element = buildInstrumentedElement('div');

      let promise = tap(element);

      assert.verifySteps([]);

      await promise;

      assert.verifySteps([
        'touchstart',
        'touchend',
        'mousedown',
        'mouseup',
        'click',
      ]);
    });

    test('rejects if selector is not found', async function (assert) {
      element = buildInstrumentedElement('div');

      await setupContext(context);

      assert.rejects(
        tap(`#foo-bar-baz-not-here-ever-bye-bye`),
        /Element not found when calling `tap\('#foo-bar-baz-not-here-ever-bye-bye'\)`/
      );
    });

    test('tapping a div via selector without context set', async function (assert) {
      element = buildInstrumentedElement('div');

      assert.rejects(
        tap(`#${element.id}`),
        /Must setup rendering context before attempting to interact with elements/
      );
    });
  });

  module('focusable element types', function () {
    let tapSteps = [
      'touchstart',
      'touchend',
      'mousedown',
      'focus',
      'focusin',
      'mouseup',
      'click',
    ];

    test('tapping a input via selector with context set', async function (assert) {
      element = buildInstrumentedElement('input');

      await setupContext(context);
      await tap(`#${element.id}`);

      assert.verifySteps(tapSteps);
      assert.strictEqual(
        document.activeElement,
        element,
        'activeElement updated'
      );
    });

    test('tapping a input via element with context set', async function (assert) {
      element = buildInstrumentedElement('input');

      await setupContext(context);
      await tap(element);

      assert.verifySteps(tapSteps);
      assert.strictEqual(
        document.activeElement,
        element,
        'activeElement updated'
      );
    });

    test('tapping a input via element without context set', async function (assert) {
      element = buildInstrumentedElement('input');

      await tap(element);

      assert.verifySteps(tapSteps);
      assert.strictEqual(
        document.activeElement,
        element,
        'activeElement updated'
      );
    });

    test('tapping a input via selector without context set', function (assert) {
      element = buildInstrumentedElement('input');

      assert.rejects(
        tap(`#${element.id}`),
        /Must setup rendering context before attempting to interact with elements/
      );
    });

    test('tapping disabled form control', function (assert) {
      element = buildInstrumentedElement('input');
      element.setAttribute('disabled', '');

      assert.rejects(
        tap(element),
        new Error('Can not `tap` disabled [object HTMLInputElement]')
      );
    });
  });

  module('focusable and non-focusable elements interaction', function () {
    test('tapping on non-focusable element triggers blur on active element', async function (assert) {
      element = document.createElement('div');

      insertElement(element);

      const focusableElement = buildInstrumentedElement('input');

      await tap(focusableElement);
      await tap(element);

      assert.verifySteps([
        'touchstart',
        'touchend',
        'mousedown',
        'focus',
        'focusin',
        'mouseup',
        'click',
        'blur',
        'focusout',
      ]);
    });

    test('tapping on focusable element triggers blur on active element', async function (assert) {
      element = document.createElement('input');

      insertElement(element);

      const focusableElement = buildInstrumentedElement('input');

      await tap(focusableElement);
      await tap(element);

      assert.verifySteps([
        'touchstart',
        'touchend',
        'mousedown',
        'focus',
        'focusin',
        'mouseup',
        'click',
        'blur',
        'focusout',
      ]);
    });

    test('tapping on non-focusable element does not trigger blur on non-focusable active element', async function (assert) {
      element = document.createElement('div');

      insertElement(element);

      const nonFocusableElement = buildInstrumentedElement('div');

      await tap(nonFocusableElement);
      await tap(element);

      assert.verifySteps([
        'touchstart',
        'touchend',
        'mousedown',
        'mouseup',
        'click',
      ]);
    });
  });
});
