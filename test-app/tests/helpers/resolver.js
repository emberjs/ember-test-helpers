import { setRegistry } from '../../resolver';
import { setResolver, setApplication } from '@ember/test-helpers';
import require from 'require';
import App from '../../app';
import config from '../../config/environment';

const AppConfig = { autoboot: false, ...config.APP };
export const application = App.create(AppConfig);
export const resolver = application.Resolver.create({
  namespace: application,
  isResolverFromTestHelpers: true,
});

setResolver(resolver);
setApplication(application);

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
    registry['event_dispatcher:main'] =
      require('ember-native-dom-event-dispatcher').default;
    // the normalized value looked up
    registry['event-dispatcher:main'] =
      require('ember-native-dom-event-dispatcher').default;
  }

  return {
    registry,
    resolve(fullName) {
      return this.registry[fullName];
    },
  };
}
