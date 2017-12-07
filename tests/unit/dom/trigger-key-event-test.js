import { module, test } from 'qunit';
import { triggerKeyEvent, setContext, unsetContext } from '@ember/test-helpers';
import { buildInstrumentedElement } from '../../helpers/events';

module('DOM Helper: triggerKeyEvent', function(hooks) {
  let element;

  hooks.beforeEach(function() {
    // used to simulate how `setupRenderingTest` (and soon `setupApplicationTest`)
    // set context.element to the rootElement
    this.element = document.querySelector('#qunit-fixture');
  });

  hooks.afterEach(function() {
    if (element) {
      element.parentNode.removeChild(element);
    }
    unsetContext();
  });

  test('throws an error if event type is missing', async function(assert) {
    element = buildInstrumentedElement('div');

    assert.throws(() => {
      setContext(this);
      triggerKeyEvent(element);
    }, /Must provide an `eventType` to `triggerKeyEvent`/);
  });

  test('throws an error if event type is invalid', async function(assert) {
    element = buildInstrumentedElement('div');

    assert.throws(() => {
      setContext(this);
      triggerKeyEvent(element, 'mouseenter');
    }, /Must provide an `eventType` of keydown, keypress, keyup to `triggerKeyEvent` but you passed `mouseenter`./);
  });

  test('throws an error if key code is missing', async function(assert) {
    element = buildInstrumentedElement('div');

    assert.throws(() => {
      setContext(this);
      triggerKeyEvent(element, 'keypress');
    }, /Must provide a `keyCode` to `triggerKeyEvent`/);
  });

  test('triggering via selector with context set', async function(assert) {
    element = buildInstrumentedElement('div');

    setContext(this);
    await triggerKeyEvent(`#${element.id}`, 'keydown', 13);

    assert.verifySteps(['keydown']);
  });

  test('triggering via element with context set', async function(assert) {
    element = buildInstrumentedElement('div');

    setContext(this);
    await triggerKeyEvent(element, 'keydown', 13);

    assert.verifySteps(['keydown']);
  });

  test('triggering via element without context set', async function(assert) {
    element = buildInstrumentedElement('div');

    await triggerKeyEvent(element, 'keydown', 13);

    assert.verifySteps(['keydown']);
  });

  ['ctrl', 'shift', 'alt', 'meta'].forEach(function(modifierType) {
    test(`triggering passing with ${modifierType} pressed`, async function(assert) {
      element = buildInstrumentedElement('div');
      element.addEventListener('keypress', e => {
        assert.ok(e[`${modifierType}Key`], `has ${modifierType} indicated`);
      });

      setContext(this);
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

    setContext(this);
    await triggerKeyEvent(element, 'keypress', 13, { altKey: true, ctrlKey: true });

    assert.verifySteps(['keypress']);
  });
});
