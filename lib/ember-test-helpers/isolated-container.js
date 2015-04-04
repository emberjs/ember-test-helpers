import { getResolver } from './test-resolver';
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
    container[method] = function() {
      return container._registry[method].apply(container._registry, arguments);
    };
  }

  for (var i = 0, l = methods.length; i < l; i++) {
    exposeRegistryMethod(container, methods[i]);
  }
}

export default function isolatedContainer(fullNames) {
  var resolver = getResolver();
  var container;

  var normalize = function(fullName) {
    return resolver.normalize(fullName);
  };

  if (Ember.Registry) {
    var registry = new Ember.Registry();
    registry.normalizeFullName = normalize;

    container = registry.container();
    exposeRegistryMethodsWithoutDeprecations(container);

  } else {
    container = new Ember.Container();

    //normalizeFullName only exists since Ember 1.9
    if (Ember.typeOf(container.normalizeFullName) === 'function') {
      container.normalizeFullName = normalize;
    } else {
      container.normalize = normalize;
    }
  }

  container.optionsForType('component', { singleton: false });
  container.optionsForType('view', { singleton: false });
  container.optionsForType('template', { instantiate: false });
  container.optionsForType('helper', { instantiate: false });
  container.register('component-lookup:main', Ember.ComponentLookup);
  container.register('controller:basic', Ember.Controller, { instantiate: false });
  container.register('controller:object', Ember.ObjectController, { instantiate: false });
  container.register('controller:array', Ember.ArrayController, { instantiate: false });
  container.register('view:default', Ember._MetamorphView);
  container.register('view:toplevel', Ember.View.extend());
  container.register('view:select', Ember.Select);
  container.register('route:basic', Ember.Route, { instantiate: false });

  var globalContext = typeof global === 'object' && global || self;
  if (globalContext.DS) {
    var DS = globalContext.DS;
    container.register('transform:boolean', DS.BooleanTransform);
    container.register('transform:date', DS.DateTransform);
    container.register('transform:number', DS.NumberTransform);
    container.register('transform:string', DS.StringTransform);
    container.register('serializer:-default', DS.JSONSerializer);
    container.register('serializer:-rest', DS.RESTSerializer);
    container.register('adapter:-rest', DS.RESTAdapter);
  }

  for (var i = fullNames.length; i > 0; i--) {
    var fullName = fullNames[i - 1];
    var normalizedFullName = resolver.normalize(fullName);
    container.register(fullName, resolver.resolve(normalizedFullName));
  }
  return container;
}
