import { module, test } from 'qunit';
import { click, setupContext, teardownContext } from '@ember/test-helpers';
import { buildInstrumentedElement } from '../../helpers/events';
import { isIE11 } from '../../helpers/browser-detect';
import hasEmberVersion from 'ember-test-helpers/has-ember-version';

module('DOM Helper: click', function(hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  let context, element;

  hooks.beforeEach(function() {
    context = {};
  });

  hooks.afterEach(async function() {
    if (element) {
      element.parentNode.removeChild(element);
    }
    if (context.owner) {
      await teardownContext(context);
    }

    document.getElementById('ember-testing').innerHTML = '';
  });

  module('non-focusable element types', function() {
    test('clicking a div via selector with context set', async function(assert) {
      element = buildInstrumentedElement('div');

      await setupContext(context);
      await click(`#${element.id}`);

      assert.verifySteps(['mousedown', 'mouseup', 'click']);
    });

    test('clicking a div via element with context set', async function(assert) {
      element = buildInstrumentedElement('div');

      await setupContext(context);
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

    test('rejects if selector is not found', async function(assert) {
      element = buildInstrumentedElement('div');

      await setupContext(context);

      assert.rejects(() => {
        return click(`#foo-bar-baz-not-here-ever-bye-bye`);
      }, /Element not found when calling `click\('#foo-bar-baz-not-here-ever-bye-bye'\)`/);
    });

    test('clicking a div via selector without context set', function(assert) {
      element = buildInstrumentedElement('div');

      assert.rejects(() => {
        return click(`#${element.id}`);
      }, /Must setup rendering context before attempting to interact with elements/);
    });
  });

  module('focusable element types', function() {
    let clickSteps = ['mousedown', 'focus', 'focusin', 'mouseup', 'click'];

    if (isIE11) {
      clickSteps = ['mousedown', 'focusin', 'mouseup', 'click', 'focus'];
    }

    test('clicking a input via selector with context set', async function(assert) {
      element = buildInstrumentedElement('input');

      await setupContext(context);
      await click(`#${element.id}`);

      assert.verifySteps(clickSteps);
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
    });

    test('clicking a input via element with context set', async function(assert) {
      element = buildInstrumentedElement('input');

      await setupContext(context);
      await click(element);

      assert.verifySteps(clickSteps);
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
    });

    test('clicking a input via element without context set', async function(assert) {
      element = buildInstrumentedElement('input');

      await click(element);

      assert.verifySteps(clickSteps);
      assert.strictEqual(document.activeElement, element, 'activeElement updated');
    });

    test('clicking a input via selector without context set', function(assert) {
      element = buildInstrumentedElement('input');

      assert.rejects(() => {
        return click(`#${element.id}`);
      }, /Must setup rendering context before attempting to interact with elements/);
    });
  });
});
