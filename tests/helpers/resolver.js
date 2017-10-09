import Ember from 'ember';
import { run } from '@ember/runloop';
import { dasherize } from '@ember/string';
import AppResolver from '../../resolver';
import config from '../../config/environment';
import { setResolver } from 'ember-test-helpers';
import require from 'require';

const Resolver = AppResolver.extend({
  registry: {},

  resolve(fullName) {
    return this.registry[fullName] || this._super(...arguments);
  },
});

const resolver = Resolver.create();

resolver.namespace = {
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
};

setResolver(resolver);

export function setResolverRegistry(registry) {
  run(resolver, 'set', 'registry', registry);
}

export default {
  create() {
    return resolver;
  },
};

export function createCustomResolver(registry) {
  if (require.has('ember-native-dom-event-dispatcher')) {
    // the raw value looked up by ember and these test helpers
    registry[
      'event_dispatcher:main'
    ] = require('ember-native-dom-event-dispatcher').default;
    // the normalized value looked up
    registry[
      'event-dispatcher:main'
    ] = require('ember-native-dom-event-dispatcher').default;
  }

  var Resolver = Ember.DefaultResolver.extend({
    registry: null,

    resolve(fullName) {
      return this.registry[fullName];
    },

    normalize(fullName) {
      return dasherize(fullName);
    },
  });

  return Resolver.create({ registry, namespace: {} });
}
