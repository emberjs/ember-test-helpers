import { getResolver } from './test-resolver';
import Ember from 'ember';

export default function isolatedContainer(fullNames) {
  var resolver = getResolver();
  var container = new Ember.Container();
  var normalize = function(fullName) {
    return resolver.normalize(fullName);
  };
  //normalizeFullName only exists since Ember 1.9
  if (Ember.typeOf(container.normalizeFullName) === 'function') {
    container.normalizeFullName = normalize;
  } else {
    container.normalize = normalize;
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

  for (var i = fullNames.length; i > 0; i--) {
    var fullName = fullNames[i - 1];
    var normalizedFullName = resolver.normalize(fullName);
    container.register(fullName, resolver.resolve(normalizedFullName));
  }
  return container;
}
