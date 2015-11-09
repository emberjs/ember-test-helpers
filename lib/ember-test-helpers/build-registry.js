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

export default function(resolver) {
  var fallbackRegistry, registry, container;
  var namespace = Ember.Object.create({
    Resolver: { create: function() { return resolver; } }
  });

  function register(name, factory) {
    var thingToRegisterWith = registry || container;

    if (!container.lookupFactory(name)) {
      thingToRegisterWith.register(name, factory);
    }
  }

  if (Ember.Application.buildRegistry) {
    fallbackRegistry = Ember.Application.buildRegistry(namespace);
    fallbackRegistry.register('component-lookup:main', Ember.ComponentLookup);

    registry = new Ember.Registry({
      fallback: fallbackRegistry
    });

    // these properties are set on the fallback registry by `buildRegistry`
    // and on the primary registry within the ApplicationInstance constructor
    // but we need to manually recreate them since ApplicationInstance's are not
    // exposed externally
    registry.normalizeFullName = fallbackRegistry.normalizeFullName;
    registry.makeToString = fallbackRegistry.makeToString;
    registry.describe = fallbackRegistry.describe;

    var owner = {
      registry: registry,
      lookup: function () {
        return this.container.lookup.apply(this.container, arguments);
      },
      _lookupFactory: function () {
        return this.container.lookupFactory.apply(this.container, arguments);
      },
      hasRegistration: function () {
        return this.registry.has.apply(this.registry, arguments);
      }
    };

    container = registry.container({ owner: owner });

    owner.container = container;
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
  if (globalContext.DS) {
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
