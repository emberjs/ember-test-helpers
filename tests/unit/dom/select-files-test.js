import { module, test } from 'qunit';
import { triggerEvent, setupContext, teardownContext } from '@ember/test-helpers';
import { buildInstrumentedElement } from '../../helpers/events';
import hasEmberVersion from 'ember-test-helpers/has-ember-version';

module('DOM Helper: selectFiles', function(hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  let context, element;

  const textFile = new Blob(['Hello World'], { type: 'text/plain' });
  textFile.name = 'text-file.txt';

  const imageFile = new Blob([], { type: 'text/png' });
  imageFile.name = 'image-file.png';

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

  test('it can trigger a file selection event more than once', async function(assert) {
    element = buildInstrumentedElement('input');
    element.setAttribute('type', 'file');

    element.addEventListener('change', e => {
      assert.step(e.target.files[0].name);
    });

    await setupContext(context);
    await triggerEvent(element, 'change', [textFile]);
    await triggerEvent(element, 'change', [imageFile]);

    assert.verifySteps(['change', 'text-file.txt', 'change', 'image-file.png']);
  });
});
