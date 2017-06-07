/* globals global, self, requirejs */

import require from 'require';
import Ember from 'ember';

function exposeRegistryMethodsWithoutDeprecations(container) {
  var methods = [
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
    'optionsForType'
  ];

  function exposeRegistryMethod(container, method) {
    if (method in container) {
      container[method] = function() {
        return container._registry[method].apply(container._registry, arguments);
      };
    }
  }

  for (var i = 0, l = methods.length; i < l; i++) {
    exposeRegistryMethod(container, methods[i]);
  }
}

const FACTORY_FOR = Ember.Container.__FACTORY_FOR__;
const LOOKUP_FACTORY = Ember.Container.__LOOKUP_FACTORY__;
const FactoryForMixin = Ember.Mixin.create({
  [FACTORY_FOR]() {
    return this.__container__[FACTORY_FOR](...arguments);
  },
  [LOOKUP_FACTORY]() {
    return this.__container__[LOOKUP_FACTORY](...arguments);
  }
});

function buildOwner() {
  if (Ember._RegistryProxyMixin && Ember._ContainerProxyMixin && FACTORY_FOR && LOOKUP_FACTORY) {
    return Ember.Object.extend(Ember._RegistryProxyMixin, Ember._ContainerProxyMixin, FactoryForMixin);
  } else if (Ember._RegistryProxyMixin && Ember._ContainerProxyMixin) {
    return Ember.Object.extend(Ember._RegistryProxyMixin, Ember._ContainerProxyMixin);
  } else if (FACTORY_FOR && LOOKUP_FACTORY) {
    return Ember.Object.extend(FactoryForMixin);
  }

  return Ember.Object.extend();
}

var Owner = (function() {
  return buildOwner();
})();

export default function(resolver) {
  var fallbackRegistry, registry, container;
  var namespace = Ember.Object.create({
    Resolver: { create() { return resolver; } }
  });

  function register(name, factory) {
    var thingToRegisterWith = registry || container;

    if (!(container.factoryFor ? container.factoryFor(name) : container.lookupFactory(name))) {
      thingToRegisterWith.register(name, factory);
    }
  }

  if (Ember.Application.buildRegistry) {
    fallbackRegistry = Ember.Application.buildRegistry(namespace);
    fallbackRegistry.register('component-lookup:main', Ember.ComponentLookup);

    registry = new Ember.Registry({
      fallback: fallbackRegistry
    });

    if (Ember.ApplicationInstance && Ember.ApplicationInstance.setupRegistry) {
      Ember.ApplicationInstance.setupRegistry(registry);
    }

    // these properties are set on the fallback registry by `buildRegistry`
    // and on the primary registry within the ApplicationInstance constructor
    // but we need to manually recreate them since ApplicationInstance's are not
    // exposed externally
    registry.normalizeFullName = fallbackRegistry.normalizeFullName;
    registry.makeToString = fallbackRegistry.makeToString;
    registry.describe = fallbackRegistry.describe;

    var owner = Owner.create({
      __registry__: registry,
      __container__: null
    });

    container = registry.container({ owner: owner });
    owner.__container__ = container;

    exposeRegistryMethodsWithoutDeprecations(container);
  } else {
    container = Ember.Application.buildContainer(namespace);
    container.register('component-lookup:main', Ember.ComponentLookup);
  }

  // Ember 1.10.0 did not properly add `view:toplevel` or `view:default`
  // to the registry in Ember.Application.buildRegistry :(
  //
  // Ember 2.0.0 removed Ember.View as public API, so only do this when
  // Ember.View is present
  if (Ember.View) {
    register('view:toplevel', Ember.View.extend());
  }

  // Ember 2.0.0 removed Ember._MetamorphView from the Ember global, so only
  // do this when present
  if (Ember._MetamorphView) {
    register('view:default', Ember._MetamorphView);
  }

  var globalContext = typeof global === 'object' && global || self;
  if (requirejs.entries['ember-data/setup-container']) {
    // ember-data is a proper ember-cli addon since 2.3; if no 'import
    // 'ember-data'' is present somewhere in the tests, there is also no `DS`
    // available on the globalContext and hence ember-data wouldn't be setup
    // correctly for the tests; that's why we import and call setupContainer
    // here; also see https://github.com/emberjs/data/issues/4071 for context
    var setupContainer = require('ember-data/setup-container')['default'];
    setupContainer(registry || container);
  } else if (globalContext.DS) {
    var DS = globalContext.DS;
    if (DS._setupContainer) {
      DS._setupContainer(registry || container);
    } else {
      register('transform:boolean', DS.BooleanTransform);
      register('transform:date', DS.DateTransform);
      register('transform:number', DS.NumberTransform);
      register('transform:string', DS.StringTransform);
      register('serializer:-default', DS.JSONSerializer);
      register('serializer:-rest', DS.RESTSerializer);
      register('adapter:-rest', DS.RESTAdapter);
    }
  }

  return {
    registry: registry,
    container: container
  };
}
