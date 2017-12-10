import { module, test } from 'qunit';
import { focus, blur, setContext, unsetContext } from '@ember/test-helpers';
import { buildInstrumentedElement } from '../../helpers/events';

module('DOM Helper: blur', function(hooks) {
  let element;

  hooks.beforeEach(async function(assert) {
    // used to simulate how `setupRenderingTest` (and soon `setupApplicationTest`)
    // set context.element to the rootElement
    this.element = document.querySelector('#qunit-fixture');

    // create the element and focus in preparation for blur testing
    element = buildInstrumentedElement('input');
    await focus(element);

    // verify that focus was ran, and reset steps
    assert.verifySteps(['focus', 'focusin']);
    assert.equal(document.activeElement, element, 'activeElement updated');
  });

  hooks.afterEach(function() {
    if (element) {
      element.parentNode.removeChild(element);
    }
    unsetContext();
  });

  test('does not run sync', async function(assert) {
    let promise = blur(element);

    assert.verifySteps([]);

    await promise;

    assert.verifySteps(['blur', 'focusout']);
  });

  test('throws an error if selector is not found', async function(assert) {
    setContext(this);
    assert.throws(() => {
      blur(`#foo-bar-baz-not-here-ever-bye-bye`);
    }, /Element not found when calling `blur\('#foo-bar-baz-not-here-ever-bye-bye'\)`/);
  });

  test('bluring via selector with context set', async function(assert) {
    setContext(this);
    await blur(`#${element.id}`);

    assert.verifySteps(['blur', 'focusout']);
    assert.notEqual(document.activeElement, element, 'activeElement updated');
  });

  test('bluring via selector without context set', async function(assert) {
    let errorThrown;

    try {
      await blur(`#${element.id}`);
    } catch (error) {
      errorThrown = error;
    }

    assert.equal(
      errorThrown.message,
      'Must setup rendering context before attempting to interact with elements.',
      'valid error was thrown'
    );
  });

  test('bluring via element with context set', async function(assert) {
    setContext(this);
    await blur(element);

    assert.verifySteps(['blur', 'focusout']);
    assert.notEqual(document.activeElement, element, 'activeElement updated');
  });

  test('bluring via element without context set', async function(assert) {
    await blur(element);

    assert.verifySteps(['blur', 'focusout']);
    assert.notEqual(document.activeElement, element, 'activeElement updated');
  });
});
