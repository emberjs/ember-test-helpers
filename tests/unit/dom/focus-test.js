import { module, test } from 'qunit';
import { focus, setContext, unsetContext } from '@ember/test-helpers';
import { buildInstrumentedElement } from '../../helpers/events';

module('DOM Helper: focus', function(hooks) {
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

  test('focusing a div via selector with context set', async function(assert) {
    element = buildInstrumentedElement('div');

    setContext(this);
    assert.throws(() => {
      focus(`#${element.id}`);
    }, /is not focusable/);
  });

  test('focusing a div via element with context set', async function(assert) {
    element = buildInstrumentedElement('div');

    setContext(this);
    assert.throws(() => {
      focus(element);
    }, /is not focusable/);
  });

  test('does not run sync', async function(assert) {
    element = buildInstrumentedElement('input');

    let promise = focus(element);

    assert.verifySteps([]);

    await promise;

    assert.verifySteps(['focus', 'focusin']);
  });

  test('throws an error if selector is not found', async function(assert) {
    element = buildInstrumentedElement('div');

    assert.throws(() => {
      setContext(this);
      focus(`#foo-bar-baz-not-here-ever-bye-bye`);
    }, /Element not found when calling `focus\('#foo-bar-baz-not-here-ever-bye-bye'\)`/);
  });

  test('focusing a input via selector with context set', async function(assert) {
    element = buildInstrumentedElement('input');

    setContext(this);
    await focus(`#${element.id}`);

    assert.verifySteps(['focus', 'focusin']);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
  });

  test('focusing a input via element with context set', async function(assert) {
    element = buildInstrumentedElement('input');

    setContext(this);
    await focus(element);

    assert.verifySteps(['focus', 'focusin']);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
  });

  test('focusing a input via element without context set', async function(assert) {
    element = buildInstrumentedElement('input');

    await focus(element);

    assert.verifySteps(['focus', 'focusin']);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
  });

  test('focusing a input via selector without context set', async function(assert) {
    element = buildInstrumentedElement('input');
    let errorThrown;

    try {
      await focus(`#${element.id}`);
    } catch (error) {
      errorThrown = error;
    }

    assert.equal(
      errorThrown.message,
      'Must setup rendering context before attempting to interact with elements.',
      'valid error was thrown'
    );
  });
});
