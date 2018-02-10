import { module, test } from 'qunit';
import { triggerKeyEvent, setupContext, teardownContext } from '@ember/test-helpers';
import { buildInstrumentedElement } from '../../helpers/events';
import hasEmberVersion from 'ember-test-helpers/has-ember-version';

module('DOM Helper: triggerKeyEvent', function(hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  let context, element;

  hooks.beforeEach(function() {
    // used to simulate how `setupRenderingTest` (and soon `setupApplicationTest`)
    // set context.element to the rootElement
    context = {
      element: document.querySelector('#qunit-fixture'),
    };
  });

  hooks.afterEach(async function() {
    if (element) {
      element.parentNode.removeChild(element);
    }

    // only teardown if setupContext was called
    if (context.owner) {
      await teardownContext(context);
    }
    document.getElementById('ember-testing').innerHTML = '';
  });

  test('rejects if event type is missing', async function(assert) {
    element = buildInstrumentedElement('div');

    await setupContext(context);

    assert.rejects(triggerKeyEvent(element), /Must provide an `eventType` to `triggerKeyEvent`/);
  });

  test('rejects if event type is invalid', async function(assert) {
    element = buildInstrumentedElement('div');

    await setupContext(context);

    assert.rejects(
      triggerKeyEvent(element, 'mouseenter'),
      /Must provide an `eventType` of keydown, keypress, keyup to `triggerKeyEvent` but you passed `mouseenter`./
    );
  });

  test('rejects if key code is missing', async function(assert) {
    element = buildInstrumentedElement('div');

    await setupContext(context);

    assert.rejects(
      triggerKeyEvent(element, 'keypress'),
      /Must provide a `keyCode` to `triggerKeyEvent`/
    );
  });

  test('triggering via selector with context set', async function(assert) {
    element = buildInstrumentedElement('div');

    await setupContext(context);
    await triggerKeyEvent(`#${element.id}`, 'keydown', 13);

    assert.verifySteps(['keydown']);
  });

  test('triggering via element with context set', async function(assert) {
    element = buildInstrumentedElement('div');

    await setupContext(context);
    await triggerKeyEvent(element, 'keydown', 13);

    assert.verifySteps(['keydown']);
  });

  test('triggering via element without context set', async function(assert) {
    element = buildInstrumentedElement('div');

    await triggerKeyEvent(element, 'keydown', 13);

    assert.verifySteps(['keydown']);
  });

  test('triggering via selector without context set', function(assert) {
    element = buildInstrumentedElement('div');

    assert.rejects(
      triggerKeyEvent(`#${element.id}`, 'keydown', 13),
      /Must setup rendering context before attempting to interact with elements/
    );
  });

  ['ctrl', 'shift', 'alt', 'meta'].forEach(function(modifierType) {
    test(`triggering passing with ${modifierType} pressed`, async function(assert) {
      element = buildInstrumentedElement('div');
      element.addEventListener('keypress', e => {
        assert.ok(e[`${modifierType}Key`], `has ${modifierType} indicated`);
      });

      await setupContext(context);
      await triggerKeyEvent(element, 'keypress', 13, { [`${modifierType}Key`]: true });

      assert.verifySteps(['keypress']);
    });
  });

  test(`can combine modifier keys`, async function(assert) {
    element = buildInstrumentedElement('div');
    element.addEventListener('keypress', e => {
      assert.ok(e.ctrlKey, `has ctrlKey indicated`);
      assert.ok(e.altKey, `has altKey indicated`);
    });

    await setupContext(context);
    await triggerKeyEvent(element, 'keypress', 13, { altKey: true, ctrlKey: true });

    assert.verifySteps(['keypress']);
  });
});
