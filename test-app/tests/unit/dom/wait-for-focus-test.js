import { module, test } from 'qunit';
import {
  waitForFocus,
  setupContext,
  teardownContext,
  find,
} from '@ember/test-helpers';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import { registerDescriptorData } from 'dom-element-descriptors';

module('DOM Helper: waitForFocus', function (hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  let context, rootElement;

  hooks.beforeEach(function () {
    context = {};
    rootElement = document.getElementById('ember-testing');
  });

  hooks.afterEach(async function () {
    // only teardown if setupContext was called
    if (context.owner) {
      await teardownContext(context);
    }
    document.getElementById('ember-testing').innerHTML = '';
  });

  class SelectorData {
    constructor(selector) {
      this.selector = selector;
    }

    get elements() {
      return rootElement.querySelectorAll(this.selector);
    }
  }

  class SelectorDescriptor {
    constructor(selector) {
      registerDescriptorData(this, new SelectorData(selector));
    }
  }

  test('wait for selector without context set', async function (assert) {
    assert.rejects(
      waitForFocus('.something'),
      /Must setup rendering context before attempting to interact with elements/
    );
  });

  test('wait for focus using descriptor without context set', async function (assert) {
    assert.rejects(
      waitForFocus('.something'),
      /Must setup rendering context before attempting to interact with elements/
    );
  });

  test('wait for focus using descriptor', async function (assert) {
    rootElement.innerHTML = `<input class="something">`;
    await setupContext(context);

    let waitPromise = waitForFocus(new SelectorDescriptor('.something'));

    setTimeout(() => {
      find('.something').focus();
    }, 10);

    let element = await waitPromise;

    assert.ok(element, 'returns element');
    assert.equal(element, find('.something'));
  });

  test('resolves when the element is already focused', async function (assert) {
    rootElement.innerHTML = `<input class="something">`;
    await setupContext(context);

    find('.something').focus();

    let waitPromise = waitForFocus('.something');
    let element = await waitPromise;

    assert.ok(element, 'returns element');
    assert.equal(element, find('.something'));
  });

  test('wait for focus using selector', async function (assert) {
    rootElement.innerHTML = `<input class="something">`;

    await setupContext(context);

    let waitPromise = waitForFocus('.something');

    setTimeout(() => {
      find('.something').focus();
    }, 10);

    let element = await waitPromise;

    assert.ok(element, 'returns element');
    assert.equal(element, find('.something'));
  });

  test('wait for selector with timeout', async function (assert) {
    assert.expect(2);

    await setupContext(context);

    let start = Date.now();
    try {
      await waitForFocus('.something', { timeout: 100 });
    } catch (error) {
      let end = Date.now();
      assert.ok(end - start >= 100, 'timed out after correct time');
      assert.equal(
        error.message,
        'waitForFocus timed out waiting for selector ".something"'
      );
    }
  });

  test('wait for selector with timeoutMessage', async function (assert) {
    assert.expect(1);

    await setupContext(context);

    try {
      await waitForFocus('.something', {
        timeoutMessage: '.something timed out',
      });
    } catch (error) {
      assert.equal(error.message, '.something timed out');
    }
  });
});
