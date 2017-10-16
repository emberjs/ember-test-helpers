import { module, test } from 'qunit';
import Service from '@ember/service';
import { setupContext } from 'ember-test-helpers';
import hasEmberVersion from 'ember-test-helpers/has-ember-version';
import { setResolverRegistry, createCustomResolver } from '../helpers/resolver';

module('setupContext', function(hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  hooks.before(function() {
    setResolverRegistry({
      'service:foo': Service.extend({ isFoo: true }),
    });
  });

  module('without options', function(hooks) {
    let context;
    hooks.beforeEach(function() {
      context = {};
      setupContext(context);
    });

    test('it sets up this.owner', function(assert) {
      let { owner } = context;
      assert.ok(owner, 'owner was setup');
      assert.equal(typeof owner.lookup, 'function', 'has expected lookup interface');

      if (hasEmberVersion(2, 12)) {
        assert.equal(typeof owner.factoryFor, 'function', 'has expected factory interface');
      }
    });

    test('it uses the default resolver if no override specified', function(assert) {
      let { owner } = context;
      let instance = owner.lookup('service:foo');
      assert.equal(instance.isFoo, true, 'uses the default resolver');
    });

    test('it sets up this.set', function(assert) {
      context.set('foo', 'bar');
      assert.equal(context.foo, 'bar', 'this.set sets the property');
    });

    test('it sets up this.setProperties', function(assert) {
      context.setProperties({
        foo: 'bar',
        baz: 'qux',
      });

      assert.equal(context.foo, 'bar', 'this.setProperties sets the first property');
      assert.equal(context.baz, 'qux', 'this.setProperties sets the second property');
    });

    test('it sets up this.get', function(assert) {
      context.set('foo', 'bar');

      assert.equal(context.get('foo'), 'bar', 'this.get can read previously set property');
    });

    test('it sets up this.getProperties', function(assert) {
      context.setProperties({
        foo: 'bar',
        baz: 'qux',
      });

      let result = context.getProperties('foo', 'baz');
      assert.deepEqual(
        result,
        {
          foo: 'bar',
          baz: 'qux',
        },
        'getProperties reads content from context'
      );
    });
  });

  module('with custom options', function() {
    test('it can specify a custom resolver', function(assert) {
      let context = {};
      let resolver = createCustomResolver({
        'service:foo': Service.extend({ isFoo: 'maybe?' }),
      });
      setupContext(context, { resolver });
      let { owner } = context;
      let instance = owner.lookup('service:foo');
      assert.equal(instance.isFoo, 'maybe?', 'uses the custom resolver');
    });
  });
});
