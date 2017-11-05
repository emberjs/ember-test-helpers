import Ember from 'ember';
import { dasherize } from '@ember/string';
import AppResolver, { setRegistry } from '../../resolver';
import config from '../../config/environment';
import { setResolver, setApplication } from 'ember-test-helpers';
import require from 'require';
import App from '../../app';

const resolver = AppResolver.create();

resolver.namespace = {
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
};

setResolver(resolver);
setApplication(App.create({ autoboot: false }));

export function setResolverRegistry(registry) {
  setRegistry(registry);
}

export default {
  create() {
    return resolver;
  },
};

export function createCustomResolver(registry) {
  if (require.has('ember-native-dom-event-dispatcher')) {
    // the raw value looked up by ember and these test helpers
    registry['event_dispatcher:main'] = require('ember-native-dom-event-dispatcher').default;
    // the normalized value looked up
    registry['event-dispatcher:main'] = require('ember-native-dom-event-dispatcher').default;
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
