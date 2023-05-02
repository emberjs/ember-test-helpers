import { setResolver, setApplication } from '@ember/test-helpers';
import App from 'test-app/app';
import config from 'test-app/config/environment';

const AppConfig = { autoboot: false, ...config.APP };
export const application = App.create(AppConfig);
export const resolver = application.Resolver.create({
  namespace: application,
  isResolverFromTestHelpers: true,
});

setResolver(resolver);
setApplication(application);

export function setResolverRegistry(owner, registry) {
  for (let [key, value] of Object.entries(registry)) {
    owner.register(key, value);
  }
}

export default {
  create() {
    return resolver;
  },
};

export function createCustomResolver(registry) {
  return {
    registry,
    resolve(fullName) {
      return this.registry[fullName];
    },
  };
}
