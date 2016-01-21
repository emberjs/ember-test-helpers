import Ember from 'ember';
import { setResolver } from 'ember-test-helpers';

var Resolver = Ember.DefaultResolver.extend({
  registry: null,

  resolve: function(fullName) {
    return this.registry[fullName];
  },

  normalize: function(fullName) {
    return Ember.String.dasherize(fullName);
  }
});

var resolver = Resolver.create({registry: {}, namespace: {}});
setResolver(resolver);

export function setResolverRegistry(registry) {
  resolver.set('registry', registry);
}

export default {
  create() {
    return resolver;
  }
};
