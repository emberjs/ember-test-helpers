import { module, test } from 'qunit';
import {
  focus,
  setupContext,
  teardownContext,
  registerHook,
} from '@ember/test-helpers';
import {
  buildInstrumentedElement,
  insertElement,
  instrumentElement,
} from '../../helpers/events';
import { isEdge } from '../../helpers/browser-detect';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';

let focusSteps = ['focus', 'focusin'];
let blurSteps = ['blur', 'focusout'];

if (isEdge) {
  blurSteps = ['focusout', 'blur'];
}

module('DOM Helper: focus', function (hooks) {
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
    // only teardown if setupContext was called
    if (context.owner) {
      await teardownContext(context);
    }
    document.getElementById('ember-testing').innerHTML = '';
  });

  test('it executes registered focus hooks', async function (assert) {
    assert.expect(3);

    element = document.createElement('input');
    insertElement(element);

    let startHook = registerHook('focus', 'start', () => {
      assert.step('focus:start');
    });
    let endHook = registerHook('focus', 'end', () => {
      assert.step('focus:end');
    });

    try {
      await focus(element);

      assert.verifySteps(['focus:start', 'focus:end']);
    } finally {
      startHook.unregister();
      endHook.unregister();
    }
  });

  test('focusing a div via selector with context set', async function (assert) {
    element = buildInstrumentedElement('div');

    await setupContext(context);
    assert.rejects(focus(`#${element.id}`), /is not focusable/);
  });

  test('focusing a div via element with context set', async function (assert) {
    element = buildInstrumentedElement('div');

    await setupContext(context);
    assert.rejects(focus(element), /is not focusable/);
  });

  test('focusing a disabled form control', async function (assert) {
    element = buildInstrumentedElement('input');
    element.setAttribute('disabled', '');

    await setupContext(context);
    assert.rejects(
      focus(`#${element.id}`, 'foo'),
      'Error: [object HTMLInputElement] is not focusable'
    );
  });

  test('does not run sync', async function (assert) {
    element = buildInstrumentedElement('input');

    let promise = focus(element);

    assert.verifySteps([]);

    await promise;

    assert.verifySteps(focusSteps);
  });

  test('blurs the previous active element', async function (assert) {
    element = buildInstrumentedElement('input', ['target']);

    const focusedElement = document.createElement('textarea');
    insertElement(focusedElement);
    focusedElement.focus();
    instrumentElement(focusedElement, ['target', 'relatedTarget']);

    await focus(element);

    assert.verifySteps([
      ...blurSteps.map((s) => {
        return `${s} [object HTMLTextAreaElement] [object HTMLInputElement]`;
      }),
      ...focusSteps.map((s) => {
        return `${s} [object HTMLInputElement]`;
      }),
    ]);
  });

  test('does not attempt to blur the previous element if it is not focusable', async function (assert) {
    element = buildInstrumentedElement('input', ['target']);

    const focusedElement = document.createElement('div');
    insertElement(focusedElement);
    focusedElement.focus();
    instrumentElement(focusedElement, ['target']);

    await focus(element);

    assert.verifySteps([
      ...focusSteps.map((s) => {
        return `${s} [object HTMLInputElement]`;
      }),
    ]);
  });

  test('rejects if selector is not found', async function (assert) {
    element = buildInstrumentedElement('div');

    await setupContext(context);

    assert.rejects(
      focus(`#foo-bar-baz-not-here-ever-bye-bye`),
      /Element not found when calling `focus\('#foo-bar-baz-not-here-ever-bye-bye'\)`/
    );
  });

  test('focusing an input via selector with context set', async function (assert) {
    element = buildInstrumentedElement('input');

    await setupContext(context);
    await focus(`#${element.id}`);

    assert.verifySteps(focusSteps);
    assert.strictEqual(
      document.activeElement,
      element,
      'activeElement updated'
    );
  });

  test('focusing an input via element with context set', async function (assert) {
    element = buildInstrumentedElement('input');

    await setupContext(context);
    await focus(element);

    assert.verifySteps(focusSteps);
    assert.strictEqual(
      document.activeElement,
      element,
      'activeElement updated'
    );
  });

  test('focusing an input via element without context set', async function (assert) {
    element = buildInstrumentedElement('input');

    await focus(element);

    assert.verifySteps(focusSteps);
    assert.strictEqual(
      document.activeElement,
      element,
      'activeElement updated'
    );
  });

  test('focusing an input via selector without context set', async function (assert) {
    element = buildInstrumentedElement('input');

    assert.rejects(
      focus(`#${element.id}`),
      /Must setup rendering context before attempting to interact with elements/
    );
  });
});
