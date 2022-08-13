import type Resolver from 'ember-resolver';
import ApplicationInstance from '@ember/application/instance';
import Application from '@ember/application';
import EmberObject from '@ember/object';

import Ember from 'ember';

/**
 * Adds methods that are normally only on registry to the container. This is largely to support the legacy APIs
 * that are not using `owner` (but are still using `this.container`).
 *
 * @private
 * @param {Object} container  the container to modify
 */
function exposeRegistryMethodsWithoutDeprecations(container: any) {
  let methods = [
    'register',
    'unregister',
    'resolve',
    'normalize',
    'typeInjection',
    'injection',
    'factoryInjection',
    'factoryTypeInjection',
    'has',
    'options',
    'optionsForType',
  ];

  for (let i = 0, l = methods.length; i < l; i++) {
    let methodName = methods[i];

    if (methodName && methodName in container) {
      const knownMethod = methodName;
      container[knownMethod] = function (...args: unknown[]) {
        return container._registry[knownMethod](...args);
      };
    }
  }
}

const RegistryProxyMixin = (Ember as any)._RegistryProxyMixin;
const ContainerProxyMixin = (Ember as any)._ContainerProxyMixin;

const Owner = EmberObject.extend(RegistryProxyMixin, ContainerProxyMixin, {
  _emberTestHelpersMockOwner: true,

  /**
   * Unregister a factory and its instance.
   *
   * Overrides `RegistryProxy#unregister` in order to clear any cached instances
   * of the unregistered factory.
   *
   * @param {string} fullName Name of the factory to unregister.
   *
   * @see {@link https://github.com/emberjs/ember.js/pull/12680}
   * @see {@link https://github.com/emberjs/ember.js/blob/v4.5.0-alpha.5/packages/%40ember/engine/instance.ts#L152-L167}
   */
  unregister(fullName: string) {
    this['__container__'].reset(fullName);

    // We overwrote this method from RegistryProxyMixin.
    this['__registry__'].unregister(fullName);
  },
});

/**
 * @private
 * @param {Object} resolver the resolver to use with the registry
 * @returns {Object} owner, container, registry
 */
export default function (resolver: Resolver) {
  let fallbackRegistry, registry, container;
  let namespace = EmberObject.create({
    Resolver: {
      create() {
        return resolver;
      },
    },
  });

  fallbackRegistry = (Application as any).buildRegistry(namespace);
  // TODO: only do this on Ember < 3.13
  fallbackRegistry.register(
    'component-lookup:main',
    (Ember as any).ComponentLookup
  );

  registry = new (Ember as any).Registry({
    fallback: fallbackRegistry,
  });

  (ApplicationInstance as any).setupRegistry(registry);

  // these properties are set on the fallback registry by `buildRegistry`
  // and on the primary registry within the ApplicationInstance constructor
  // but we need to manually recreate them since ApplicationInstance's are not
  // exposed externally
  registry.normalizeFullName = fallbackRegistry.normalizeFullName;
  registry.makeToString = fallbackRegistry.makeToString;
  registry.describe = fallbackRegistry.describe;

  let owner = Owner.create({
    __registry__: registry,
    __container__: null,
  });

  container = registry.container({ owner: owner });
  owner.__container__ = container;

  exposeRegistryMethodsWithoutDeprecations(container);

  return {
    registry,
    container,
    owner,
  };
}
