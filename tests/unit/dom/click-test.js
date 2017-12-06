import { module, test } from 'qunit';
import { click, setContext, unsetContext } from '@ember/test-helpers';
import { buildInstrumentedElement } from '../../helpers/events';

module('DOM Helper: click', function(hooks) {
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

  module('non-focusable element types', function() {
    test('clicking a div via selector with context set', async function(assert) {
      element = buildInstrumentedElement('div');

      setContext(this);
      await click(`#${element.id}`);

      assert.verifySteps(['mousedown', 'mouseup', 'click']);
    });

    test('clicking a div via element with context set', async function(assert) {
      element = buildInstrumentedElement('div');

      setContext(this);
      await click(element);

      assert.verifySteps(['mousedown', 'mouseup', 'click']);
    });

    test('clicking a div via element without context set', async function(assert) {
      element = buildInstrumentedElement('div');

      await click(element);

      assert.verifySteps(['mousedown', 'mouseup', 'click']);
    });

    test('does not run sync', async function(assert) {
      element = buildInstrumentedElement('div');

      let promise = click(element);

      assert.verifySteps([]);

      await promise;

      assert.verifySteps(['mousedown', 'mouseup', 'click']);
    });

    test('throws an error if selector is not found', async function(assert) {
      element = buildInstrumentedElement('div');

      assert.throws(() => {
        setContext(this);
        click(`#foo-bar-baz-not-here-ever-bye-bye`);
      }, /Element not found when calling `click\('#foo-bar-baz-not-here-ever-bye-bye'\)`/);
    });
  });

  module('focusable element types', function() {
    test('clicking a input via selector with context set', async function(assert) {
      element = buildInstrumentedElement('input');

      setContext(this);
      await click(`#${element.id}`);

      assert.verifySteps(['mousedown', 'focus', 'focusin', 'mouseup', 'click']);
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
    });

    test('clicking a input via element with context set', async function(assert) {
      element = buildInstrumentedElement('input');

      setContext(this);
      await click(element);

      assert.verifySteps(['mousedown', 'focus', 'focusin', 'mouseup', 'click']);
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
    });

    test('clicking a input via element without context set', async function(assert) {
      element = buildInstrumentedElement('input');

      await click(element);

      assert.verifySteps(['mousedown', 'focus', 'focusin', 'mouseup', 'click']);
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
    });
  });
});
