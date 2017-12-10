import { module, test } from 'qunit';
import { triggerEvent, setContext, unsetContext } from '@ember/test-helpers';
import { buildInstrumentedElement } from '../../helpers/events';

module('DOM Helper: triggerEvent', function(hooks) {
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

  test('can trigger arbitrary event types', async function(assert) {
    element = buildInstrumentedElement('div');
    element.addEventListener('fliberty', e => {
      assert.step('fliberty');
      assert.ok(e instanceof Event, `fliberty listener receives a native event`);
    });

    setContext(context);
    await triggerEvent(`#${element.id}`, 'fliberty');

    assert.verifySteps(['fliberty']);
  });

  test('triggering event via selector with context set fires the given event type', async function(assert) {
    element = buildInstrumentedElement('div');

    setContext(context);
    await triggerEvent(`#${element.id}`, 'mouseenter');

    assert.verifySteps(['mouseenter']);
  });

  test('triggering event via element with context set fires the given event type', async function(assert) {
    element = buildInstrumentedElement('div');

    setContext(context);
    await triggerEvent(element, 'mouseenter');

    assert.verifySteps(['mouseenter']);
  });

  test('triggering event via element without context set fires the given event type', async function(assert) {
    element = buildInstrumentedElement('div');

    await triggerEvent(element, 'mouseenter');

    assert.verifySteps(['mouseenter']);
  });

  test('triggering event via selector without context set', async function(assert) {
    element = buildInstrumentedElement('div');

    let errorThrown;

    try {
      await triggerEvent(`#${element.id}`, 'mouseenter');
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
    element = buildInstrumentedElement('div');

    let promise = triggerEvent(element, 'mouseenter');

    assert.verifySteps([]);

    await promise;

    assert.verifySteps(['mouseenter']);
  });

  test('throws an error if selector is not found', async function(assert) {
    element = buildInstrumentedElement('div');

    assert.throws(() => {
      setContext(context);
      triggerEvent(`#foo-bar-baz-not-here-ever-bye-bye`, 'mouseenter');
    }, /Element not found when calling `triggerEvent\('#foo-bar-baz-not-here-ever-bye-bye'/);
  });

  test('throws an error if event type is not passed', async function(assert) {
    element = buildInstrumentedElement('div');

    assert.throws(() => {
      setContext(context);
      triggerEvent(element);
    }, /Must provide an `eventType` to `triggerEvent`/);
  });

  test('events properly bubble upwards', async function(assert) {
    setContext(context);
    element = buildInstrumentedElement('div');
    element.innerHTML = `
      <div id="outer">
        <div id="inner"></div>
      </div>
    `;

    let outer = element.querySelector('#outer');
    let inner = element.querySelector('#inner');

    outer.addEventListener('mouseenter', () => {
      assert.step('outer: mouseenter');
    });

    inner.addEventListener('mouseenter', () => {
      assert.step('inner: mouseenter');
    });

    await triggerEvent('#inner', 'mouseenter');

    assert.verifySteps(['inner: mouseenter', 'outer: mouseenter', 'mouseenter']);
  });
});
