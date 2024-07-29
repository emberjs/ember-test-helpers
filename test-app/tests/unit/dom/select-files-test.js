import { module, test } from 'qunit';
import {
  triggerEvent,
  setupContext,
  teardownContext,
} from '@ember/test-helpers';
import { buildInstrumentedElement } from '../../helpers/events';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';

module('DOM Helper: selectFiles', function (hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  let context, element;

  const textFile = new Blob(['Hello World'], { type: 'text/plain' });
  textFile.name = 'text-file.txt';

  const imageFile = new Blob([], { type: 'text/png' });
  imageFile.name = 'image-file.png';

  hooks.beforeEach(function () {
    // used to simulate how `setupRenderingTest` (and soon `setupApplicationTest`)
    // set context.element to the rootElement
    context = {
      element: document.querySelector('#qunit-fixture'),
    };
  });

  hooks.afterEach(async function () {
    if (element) {
      element.parentNode.removeChild(element);
      element = null;
    }

    // only teardown if setupContext was called
    if (context.owner) {
      await teardownContext(context);
    }
    document.getElementById('ember-testing').innerHTML = '';
  });

  test('it can trigger a file selection event more than once', async function (assert) {
    element = buildInstrumentedElement('input');
    element.setAttribute('type', 'file');

    element.addEventListener('change', (e) => {
      assert.step(e.target.files[0].name);
    });

    await setupContext(context);
    await triggerEvent(element, 'change', { files: [textFile] });
    await triggerEvent(element, 'change', { files: [imageFile] });

    assert.verifySteps(['change', 'text-file.txt', 'change', 'image-file.png']);
  });

  test('it can trigger a file selection event with files passed in options as an object', async function (assert) {
    element = buildInstrumentedElement('input');
    element.setAttribute('type', 'file');

    element.addEventListener('change', (e) => {
      assert.step(e.target.files[0].name);
    });

    await setupContext(context);
    await triggerEvent(element, 'change', { files: [textFile] });

    assert.verifySteps(['change', 'text-file.txt']);
  });

  test('it can trigger a file selection event with an empty files array', async function (assert) {
    element = buildInstrumentedElement('input');
    element.setAttribute('type', 'file');

    element.addEventListener('change', (e) => {
      assert.equal(e.target.files.length, 0, 'Files should be empty');
      assert.step('empty');
    });

    await setupContext(context);
    await triggerEvent(element, 'change', { files: [] });

    assert.verifySteps(['change', 'empty']);
  });

  test('setting an empty value resets selected files', async function (assert) {
    element = buildInstrumentedElement('input');
    element.setAttribute('type', 'file');

    element.addEventListener('change', (e) => {
      assert.step(e.target.files[0].name);
    });

    await setupContext(context);
    await triggerEvent(element, 'change', { files: [imageFile] });
    element.value = '';

    assert.verifySteps(['change', 'image-file.png']);
    assert.equal(element.files.length, 0, 'Files should be empty');
  });

  test('can trigger file event with same selection twice without error', async function (assert) {
    element = buildInstrumentedElement('input');
    element.setAttribute('type', 'file');

    element.addEventListener('change', (e) => {
      assert.step(e.target.files[0].name);
    });

    await setupContext(context);

    const files = [
      new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' }),
    ];
    await triggerEvent(element, 'change', { files });
    await triggerEvent(element, 'change', { files });

    assert.verifySteps([
      'change',
      'chucknorris.png',
      'change',
      'chucknorris.png',
    ]);
  });
});
