import { module, test } from 'qunit';
import Service, { inject as injectService } from '@ember/service';
import { setupContext, getContext } from 'ember-test-helpers';
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

    test('it calls setContext with the provided context', function(assert) {
      assert.equal(getContext(), context);
    });

    test('can be used for unit style testing', function(assert) {
      context.owner.register(
        'service:foo',
        Service.extend({
          someMethod() {
            return 'hello thar!';
          },
        })
      );

      let subject = context.owner.lookup('service:foo');

      assert.equal(subject.someMethod(), 'hello thar!');
    });

    test('can access a service instance (instead of this.inject.service("thing") in 0.6)', function(
      assert
    ) {
      context.owner.register('service:bar', Service.extend());
      context.owner.register(
        'service:foo',
        Service.extend({
          bar: injectService(),
          someMethod() {
            this.set('bar.someProp', 'derp');
          },
        })
      );

      let subject = context.owner.lookup('service:foo');
      let bar = context.owner.lookup('service:bar');

      assert.notOk(bar.get('someProp'), 'precond - initially undefined');

      subject.someMethod();

      assert.equal(bar.get('someProp'), 'derp', 'property updated');
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
