/* globals requirejs */
import global from './global';

import ApplicationInstance from '@ember/application/instance';
import Application from '@ember/application';
import EmberObject from '@ember/object';
import { Promise } from 'rsvp';

import require from 'require';
import Ember from 'ember';

let Owner;

// different than the legacy-0-6-x version (build-registry.js)
// in the following ways:
//
// * Accepts an application to _actually_ boot if possible
// * falls back to "fake owner" if application is not present
// * fewer fallbacks (supports only Ember 2.4+)
// * returns "owner" (instead of a POJO with registry/container)
export default function({ application, resolver }) {
  if (application) {
    return application.boot().then(app => app.buildInstance().boot());
  }

  if (!resolver) {
    throw new Error(
      'You must set up the ember-test-helpers environment with either `setResolver` or `setApplication` before running any tests.'
    );
  }

  if (Owner === undefined) {
    Owner = EmberObject.extend(Ember._RegistryProxyMixin, Ember._ContainerProxyMixin, {
      _emberTestHelpersMockOwner: true,
    });
  }

  let fallbackRegistry, registry, container;
  let namespace = EmberObject.create({
    Resolver: {
      create() {
        return resolver;
      },
    },
  });

  function register(name, factory) {
    let thingToRegisterWith = registry || container;
    let existingFactory = container.factoryFor
      ? container.factoryFor(name)
      : container.lookupFactory(name);

    if (!existingFactory) {
      thingToRegisterWith.register(name, factory);
    }
  }

  fallbackRegistry = Application.buildRegistry(namespace);
  fallbackRegistry.register('component-lookup:main', Ember.ComponentLookup);

  registry = new Ember.Registry({
    fallback: fallbackRegistry,
  });

  // Ember.ApplicationInstance was exposed in Ember 2.8
  if (ApplicationInstance && ApplicationInstance.setupRegistry) {
    ApplicationInstance.setupRegistry(registry);
  }

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

  // TODO: this manual Ember Data setup should be removed in favor of
  // running the applications `initializers` to ensure the container is
  // properly setup, this would only need to be done once per test suite
  if (
    (typeof require.has === 'function' && require.has('ember-data/setup-container')) ||
    requirejs.entries['ember-data/setup-container']
  ) {
    // ember-data is a proper ember-cli addon since 2.3; if no 'import
    // 'ember-data'' is present somewhere in the tests, there is also no `DS`
    // available on the globalContext and hence ember-data wouldn't be setup
    // correctly for the tests; that's why we import and call setupContainer
    // here; also see https://github.com/emberjs/data/issues/4071 for context
    let setupContainer = require('ember-data/setup-container')['default'];
    setupContainer(registry);
  } else if (global.DS) {
    let DS = global.DS;
    if (DS._setupContainer) {
      DS._setupContainer(registry);
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

  return Promise.resolve().then(() => owner);
}
