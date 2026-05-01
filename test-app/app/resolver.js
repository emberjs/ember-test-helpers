import Resolver from 'ember-resolver';

export let registry = Object.create(null);
export function setRegistry(newRegistry) {
  registry = newRegistry;
}

export default class AppResolver extends Resolver {
  resolve(fullName) {
    return registry[fullName] || super.resolve(fullName);
  }
}
