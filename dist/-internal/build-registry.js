import ApplicationInstance from '@ember/application/instance';
import Application from '@ember/application';
import EmberObject from '@ember/object';
import Ember from 'ember';
import { RegistryProxyMixin, ContainerProxyMixin } from './-owner-mixin-imports.js';

/**
 * Adds methods that are normally only on registry to the container. This is largely to support the legacy APIs
 * that are not using `owner` (but are still using `this.container`).
 *
 * @private
 * @param {Object} container  the container to modify
 */
function exposeRegistryMethodsWithoutDeprecations(container) {
  const methods = ['register', 'unregister', 'resolve', 'normalize', 'typeInjection', 'injection', 'factoryInjection', 'factoryTypeInjection', 'has', 'options', 'optionsForType'];
  for (let i = 0, l = methods.length; i < l; i++) {
    const methodName = methods[i];
    if (methodName && methodName in container) {
      const knownMethod = methodName;
      container[knownMethod] = function (...args) {
        return container._registry[knownMethod](...args);
      };
    }
  }
}

// NOTE: this is the same as what `EngineInstance`/`ApplicationInstance`
// implement, and is thus a superset of the `InternalOwner` contract from Ember
// itself.

const Owner = EmberObject.extend(RegistryProxyMixin, ContainerProxyMixin, {
  _emberTestHelpersMockOwner: true,
  /* eslint-disable valid-jsdoc */
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
  /* eslint-enable valid-jsdoc */
  unregister(fullName) {
    // SAFETY: this is always present, but only the stable type definitions from
    // Ember actually preserve it, since it is private API.
    this['__container__'].reset(fullName);

    // We overwrote this method from RegistryProxyMixin.
    // SAFETY: this is always present, but only the stable type definitions from
    // Ember actually preserve it, since it is private API.
    this['__registry__'].unregister(fullName);
  }
});

/**
 * @private
 * @param {Object} resolver the resolver to use with the registry
 * @returns {Object} owner, container, registry
 */
function buildRegistry(resolver) {
  const namespace = new Application();
  // @ts-ignore: this is actually the correcct type, but there was a typo in
  // Ember's docs for many years which meant that there was a matching problem
  // in the types for Ember's definition of `Engine`. Once we require at least
  // Ember 5.1 (in some future breaking change), this ts-ignore can be removed.
  namespace.Resolver = {
    create() {
      return resolver;
    }
  };

  // @ts-ignore: this is private API.
  const fallbackRegistry = Application.buildRegistry(namespace);
  // TODO: only do this on Ember < 3.13
  // @ts-ignore: this is private API.
  fallbackRegistry.register('component-lookup:main', Ember.ComponentLookup);

  // @ts-ignore: this is private API.
  const registry = new Ember.Registry({
    fallback: fallbackRegistry
  });

  // @ts-ignore: this is private API.
  ApplicationInstance.setupRegistry(registry);

  // these properties are set on the fallback registry by `buildRegistry`
  // and on the primary registry within the ApplicationInstance constructor
  // but we need to manually recreate them since ApplicationInstance's are not
  // exposed externally
  // @ts-ignore: this is private API.
  registry.normalizeFullName = fallbackRegistry.normalizeFullName;
  // @ts-ignore: this is private API.
  registry.makeToString = fallbackRegistry.makeToString;
  // @ts-ignore: this is private API.
  registry.describe = fallbackRegistry.describe;
  const owner = Owner.create({
    // @ts-ignore -- we do not have type safety for `Object.extend` so the type
    // of `Owner` here is just `EmberObject`, but we *do* constrain it to allow
    // only types from the actual class, so these fields are not accepted.
    // However, we can see that they are valid, based on the definition of
    // `Owner` above given that it fulfills the `InternalOwner` contract and
    // also extends it just as `EngineInstance` does internally.
    //
    // NOTE: we use an `ignore` directive rather than `expect-error` because in
    // *some* versions of the types, we *do* have (at least some of) this
    // safety, and maximal backwards compatibility means we have to account for
    // that.
    __registry__: registry,
    __container__: null
  });

  // @ts-ignore: this is private API.
  const container = registry.container({
    owner: owner
  });
  // @ts-ignore: this is private API.
  owner.__container__ = container;
  exposeRegistryMethodsWithoutDeprecations(container);
  return {
    registry,
    container,
    owner
  };
}

export { buildRegistry as default };
//# sourceMappingURL=build-registry.js.map
