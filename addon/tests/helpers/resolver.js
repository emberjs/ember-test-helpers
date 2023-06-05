import { setRegistry } from '../../resolver';
import { setResolver, setApplication } from '@ember/test-helpers';
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
  return {
    registry,
    resolve(fullName) {
      return this.registry[fullName];
    },
  };
}
