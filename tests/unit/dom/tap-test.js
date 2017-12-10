import { module, test } from 'qunit';
import { tap, setContext, unsetContext } from '@ember/test-helpers';
import { buildInstrumentedElement } from '../../helpers/events';

module('DOM Helper: tap', function(hooks) {
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

  module('non-focusable element types', function() {
    test('taping a div via selector with context set', async function(assert) {
      element = buildInstrumentedElement('div');

      setContext(context);
      await tap(`#${element.id}`);

      assert.verifySteps(['touchstart', 'touchend', 'mousedown', 'mouseup', 'click']);
    });

    test('tapping a div via element with context set', async function(assert) {
      element = buildInstrumentedElement('div');

      setContext(context);
      await tap(element);

      assert.verifySteps(['touchstart', 'touchend', 'mousedown', 'mouseup', 'click']);
    });

    test('tapping a div via element without context set', async function(assert) {
      element = buildInstrumentedElement('div');

      await tap(element);

      assert.verifySteps(['touchstart', 'touchend', 'mousedown', 'mouseup', 'click']);
    });

    test('does not run sync', async function(assert) {
      element = buildInstrumentedElement('div');

      let promise = tap(element);

      assert.verifySteps([]);

      await promise;

      assert.verifySteps(['touchstart', 'touchend', 'mousedown', 'mouseup', 'click']);
    });

    test('throws an error if selector is not found', async function(assert) {
      element = buildInstrumentedElement('div');

      assert.throws(() => {
        setContext(context);
        tap(`#foo-bar-baz-not-here-ever-bye-bye`);
      }, /Element not found when calling `tap\('#foo-bar-baz-not-here-ever-bye-bye'\)`/);
    });

    test('tapping a div via selector without context set', async function(assert) {
      element = buildInstrumentedElement('div');
      let errorThrown;

      try {
        await tap(`#${element.id}`);
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

  module('focusable element types', function() {
    test('tapping a input via selector with context set', async function(assert) {
      element = buildInstrumentedElement('input');

      setContext(context);
      await tap(`#${element.id}`);

      assert.verifySteps([
        'touchstart',
        'touchend',
        'mousedown',
        'focus',
        'focusin',
        'mouseup',
        'click',
      ]);
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
    });

    test('tapping a input via element with context set', async function(assert) {
      element = buildInstrumentedElement('input');

      setContext(context);
      await tap(element);

      assert.verifySteps([
        'touchstart',
        'touchend',
        'mousedown',
        'focus',
        'focusin',
        'mouseup',
        'click',
      ]);
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
    });

    test('tapping a input via element without context set', async function(assert) {
      element = buildInstrumentedElement('input');

      await tap(element);

      assert.verifySteps([
        'touchstart',
        'touchend',
        'mousedown',
        'focus',
        'focusin',
        'mouseup',
        'click',
      ]);
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
    });

    test('tapping a input via selector without context set', async function(assert) {
      element = buildInstrumentedElement('input');
      let errorThrown;

      try {
        await tap(`#${element.id}`);
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
});
