import { module, test } from 'qunit';
import {
  setupContext,
  setupRenderingContext,
  teardownContext,
  teardownRenderingContext,
} from 'ember-test-helpers';
import hasEmberVersion from 'ember-test-helpers/has-ember-version';

module('setupRenderingContext', function(hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  hooks.beforeEach(async function() {
    await setupContext(this);
    await setupRenderingContext(this);
  });

  hooks.afterEach(function() {
    return teardownContext(this);
  });

  test('clears any attributes added to the ember-testing div', async function(assert) {
    let beforeTeardownEl = document.getElementById('ember-testing');
    beforeTeardownEl.setAttribute('data-was-set', '');

    assert.ok(
      beforeTeardownEl.hasAttribute('data-was-set'),
      'precond - attribute is present before teardown'
    );
    assert.ok(document.contains(beforeTeardownEl), 'precond - ember-testing element is in DOM');

    await teardownRenderingContext(this);
    await teardownContext(this);

    let afterTeardownEl = document.getElementById('ember-testing');

    assert.notOk(
      afterTeardownEl.hasAttribute('data-was-set'),
      'attribute is not present on ember-testing that is in DOM'
    );
    assert.ok(document.contains(afterTeardownEl), 'ember-testing element is still in DOM');

    assert.ok(
      beforeTeardownEl.hasAttribute('data-was-set'),
      'attribute is still present on prior ember-testing element after teardown'
    );
    assert.notOk(
      document.contains(beforeTeardownEl),
      'previous ember-testing element is no longer in DOM'
    );
  });
});
