import Ember from 'ember';
import { setResolver } from 'ember-test-helpers';

var Resolver = Ember.DefaultResolver.extend({
  registry: null,

  resolve(fullName) {
    return this.registry[fullName];
  },

  normalize(fullName) {
    return Ember.String.dasherize(fullName);
  }
});

var resolver = Resolver.create({registry: {}, namespace: {}});
setResolver(resolver);

export function setResolverRegistry(registry) {
  Ember.run(resolver, 'set', 'registry', registry);
}

export default {
  create() {
    return resolver;
  }
};

export function createCustomResolver(registry) {
  var Resolver = Ember.DefaultResolver.extend({
    registry: null,

    resolve(fullName) {
      return this.registry[fullName];
    },

    normalize(fullName) {
      return Ember.String.dasherize(fullName);
    }
  });

  return Resolver.create({ registry, namespace: {} });
}
