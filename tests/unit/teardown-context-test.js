import { module, test } from 'qunit';
import Service from '@ember/service';
import { setupContext, teardownContext } from 'ember-test-helpers';
import { setResolverRegistry } from '../helpers/resolver';

module('teardownContext', function(hooks) {
  hooks.before(function() {
    setResolverRegistry({
      'service:foo': Service.extend({ isFoo: true }),
    });
  });

  let context;
  hooks.beforeEach(function() {
    context = {};
    setupContext(context);
  });

  test('it destroys any instances created', function(assert) {
    let instance = context.owner.lookup('service:foo');
    assert.notOk(instance.isDestroyed, 'precond - not destroyed');
    assert.notOk(instance.isDestroying, 'precond - not destroying');

    teardownContext(context);

    assert.ok(instance.isDestroyed, 'destroyed');
    assert.ok(instance.isDestroying, 'destroying');
  });
});
