import { module, test } from 'qunit';
import { getRootElement, setupContext, teardownContext } from '@ember/test-helpers';
import hasEmberVersion from 'ember-test-helpers/has-ember-version';

module('DOM Helper: getRootElement', function(hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  let context;

  hooks.beforeEach(function() {
    context = {};
  });

  hooks.afterEach(async function() {
    if (context.owner) {
      await teardownContext(context);
    }

    document.getElementById('ember-testing').innerHTML = '';
  });

  test('works with context set', async function(assert) {
    await setupContext(context);

    let fixture = document.querySelector('#ember-testing');
    assert.equal(getRootElement(), fixture);
  });

  test('throws without context set', function(assert) {
    assert.throws(() => {
      getRootElement();
    }, /Must setup rendering context before attempting to interact with elements/);
  });
});
