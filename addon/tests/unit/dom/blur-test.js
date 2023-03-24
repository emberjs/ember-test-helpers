import { module, test } from 'qunit';
import {
  focus,
  blur,
  setupContext,
  teardownContext,
  registerHook,
} from '@ember/test-helpers';
import { buildInstrumentedElement, insertElement } from '../../helpers/events';
import { isEdge } from '../../helpers/browser-detect';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';

let focusSteps = ['focus', 'focusin'];
let blurSteps = ['blur', 'focusout'];

if (isEdge) {
  blurSteps = ['focusout', 'blur'];
}

module('DOM Helper: blur', function (hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  let context, elementWithFocus;

  hooks.beforeEach(async function (assert) {
    context = {};

    // create the element and focus in preparation for blur testing
    elementWithFocus = buildInstrumentedElement('input');
    await focus(elementWithFocus);

    // verify that focus was ran, and reset steps
    assert.verifySteps(focusSteps);
    assert.equal(
      document.activeElement,
      elementWithFocus,
      'activeElement updated'
    );
  });

  hooks.afterEach(async function () {
    if (elementWithFocus) {
      elementWithFocus.parentNode.removeChild(elementWithFocus);
    }
    // only teardown if setupContext was called
    if (context.owner) {
      await teardownContext(context);
    }
    document.getElementById('ember-testing').innerHTML = '';
  });

  test('it executes registered blur hooks', async function (assert) {
    assert.expect(13);

    let element = document.createElement('input');
    insertElement(element);

    await focus(element);

    let startHook = registerHook('blur', 'start', () => {
      assert.step('blur:start');
    });
    let endHook = registerHook('blur', 'end', () => {
      assert.step('blur:end');
    });

    try {
      await blur(elementWithFocus);

      assert.verifySteps(['blur', 'focusout', 'blur:start', 'blur:end']);
    } finally {
      startHook.unregister();
      endHook.unregister();
    }
  });

  test('does not run sync', async function (assert) {
    let promise = blur(elementWithFocus);

    assert.verifySteps([]);

    await promise;

    assert.verifySteps(blurSteps);
  });

  test('rejects if selector is not found', async function (assert) {
    elementWithFocus.setAttribute('data-skip-steps', true);

    await setupContext(context);

    assert.rejects(
      blur(`#foo-bar-baz-not-here-ever-bye-bye`),
      /Element not found when calling `blur\('#foo-bar-baz-not-here-ever-bye-bye'\)`/
    );
  });

  test('blurring via selector with context set', async function (assert) {
    await setupContext(context);
    await blur(`#${elementWithFocus.id}`);

    assert.verifySteps(blurSteps);
    assert.notEqual(
      document.activeElement,
      elementWithFocus,
      'activeElement updated'
    );
  });

  test('blurring via selector without context set', function (assert) {
    elementWithFocus.setAttribute('data-skip-steps', true);

    assert.rejects(
      blur(`#${elementWithFocus.id}`),
      /Must setup rendering context before attempting to interact with elements/
    );
  });

  test('blurring via element with context set', async function (assert) {
    await setupContext(context);
    await blur(elementWithFocus);

    assert.verifySteps(blurSteps);
    assert.notEqual(
      document.activeElement,
      elementWithFocus,
      'activeElement updated'
    );
  });

  test('blurring via element without context set', async function (assert) {
    await blur(elementWithFocus);

    assert.verifySteps(blurSteps);
    assert.notEqual(
      document.activeElement,
      elementWithFocus,
      'activeElement updated'
    );
  });
});
