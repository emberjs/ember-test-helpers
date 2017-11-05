import { module, test } from 'qunit';
import Service from '@ember/service';
import { setupContext, teardownContext } from 'ember-test-helpers';
import { setResolverRegistry } from '../helpers/resolver';
import hasEmberVersion from 'ember-test-helpers/has-ember-version';
import Ember from 'ember';

module('teardownContext', function(hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  hooks.before(function() {
    setResolverRegistry({
      'service:foo': Service.extend({ isFoo: true }),
    });
  });

  let context;
  hooks.beforeEach(function() {
    context = {};
    return setupContext(context);
  });

  test('it destroys any instances created', async function(assert) {
    let instance = context.owner.lookup('service:foo');
    assert.notOk(instance.isDestroyed, 'precond - not destroyed');
    assert.notOk(instance.isDestroying, 'precond - not destroying');

    await teardownContext(context);

    assert.ok(instance.isDestroyed, 'destroyed');
    assert.ok(instance.isDestroying, 'destroying');
  });

  test('it sets Ember.testing to false', async function(assert) {
    assert.ok(Ember.testing, 'precond - Ember.testing is truthy');

    await teardownContext(context);

    assert.notOk(Ember.testing, 'Ember.testing is falsey after teardown');
  });
});
