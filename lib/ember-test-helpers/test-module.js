import Ember from 'ember';
import AbstractTestModule from './abstract-test-module';
import { getResolver } from './test-resolver';
import buildRegistry from './build-registry';
import hasEmberVersion from './has-ember-version';

export default AbstractTestModule.extend({
  init: function(subjectName, description, callbacks) {
    // Allow `description` to be omitted, in which case it should
    // default to `subjectName`
    if (!callbacks && typeof description === 'object') {
      callbacks = description;
      description = subjectName;
    }

    this.subjectName = subjectName;
    this.description = description || subjectName;
    this.name = description || subjectName;
    this.callbacks = callbacks || {};
    this.resolver = this.callbacks.resolver || getResolver();

    if (this.callbacks.integration && this.callbacks.needs) {
      throw new Error("cannot declare 'integration: true' and 'needs' in the same module");
    }

    if (this.callbacks.integration) {
      if (this.isComponentTestModule) {
        this.isLegacy = (callbacks.integration === 'legacy');
        this.isIntegration = (callbacks.integration !== 'legacy');
      } else {
        if (callbacks.integration === 'legacy') {
          throw new Error('`integration: \'legacy\'` is only valid for component tests.');
        }
        this.isIntegration = true;
      }

      delete callbacks.integration;
    }

    this.initSubject();
    this.initNeeds();
    this.initSetupSteps();
    this.initTeardownSteps();
  },

  initSubject: function() {
    this.callbacks.subject = this.callbacks.subject || this.defaultSubject;
  },

  initNeeds: function() {
    this.needs = [this.subjectName];
    if (this.callbacks.needs) {
      this.needs = this.needs.concat(this.callbacks.needs);
      delete this.callbacks.needs;
    }
  },

  initSetupSteps: function() {
    this.setupSteps = [];
    this.contextualizedSetupSteps = [];

    if (this.callbacks.beforeSetup) {
      this.setupSteps.push( this.callbacks.beforeSetup );
      delete this.callbacks.beforeSetup;
    }

    this.setupSteps.push(this.setupContainer);
    this.setupSteps.push(this.setupContext);
    this.setupSteps.push(this.setupTestElements);
    this.setupSteps.push(this.setupAJAXListeners);

    if (this.callbacks.setup) {
      this.contextualizedSetupSteps.push( this.callbacks.setup );
      delete this.callbacks.setup;
    }
  },

  initTeardownSteps: function() {
    this.teardownSteps = [];
    this.contextualizedTeardownSteps = [];

    if (this.callbacks.teardown) {
      this.contextualizedTeardownSteps.push( this.callbacks.teardown );
      delete this.callbacks.teardown;
    }

    this.teardownSteps.push(this.teardownSubject);
    this.teardownSteps.push(this.teardownContainer);
    this.teardownSteps.push(this.teardownContext);
    this.teardownSteps.push(this.teardownTestElements);
    this.teardownSteps.push(this.teardownAJAXListeners);

    if (this.callbacks.afterTeardown) {
      this.teardownSteps.push( this.callbacks.afterTeardown );
      delete this.callbacks.afterTeardown;
    }
  },

  setupContainer: function() {
    if (this.isIntegration || this.isLegacy) {
      this._setupIntegratedContainer();
    } else {
      this._setupIsolatedContainer();
    }
  },

  setupContext: function() {
    var subjectName = this.subjectName;
    var container = this.container;

    var factory = function() {
      return container.lookupFactory(subjectName);
    };

    this._super({
      container:  this.container,
      registry: this.registry,
      factory:    factory,
      register: function() {
        var target = this.registry || this.container;
        return target.register.apply(target, arguments);
      }
    });

    if (Ember.setOwner) {
      Ember.setOwner(this.context, this.container.owner);
    }

    this.setupInject();
  },

  setupInject: function() {
    var module = this;
    var context = this.context;

    if (Ember.inject) {
      var keys = (Object.keys || Ember.keys)(Ember.inject);

      keys.forEach(function(typeName) {
        context.inject[typeName] = function(name, opts) {
          var alias = (opts && opts.as) || name;
          Ember.run(function() {
            Ember.set(context, alias, module.container.lookup(typeName + ':' + name));
          });
        };
      });
    }
  },

  teardownSubject: function() {
    var subject = this.cache.subject;

    if (subject) {
      Ember.run(function() {
        Ember.tryInvoke(subject, 'destroy');
      });
    }
  },

  teardownContainer: function() {
    var container = this.container;
    Ember.run(function() {
      container.destroy();
    });
  },

  defaultSubject: function(options, factory) {
    return factory.create(options);
  },

  // allow arbitrary named factories, like rspec let
  contextualizeCallbacks: function() {
    var callbacks = this.callbacks;
    var context   = this.context;

    this.cache = this.cache || {};
    this.cachedCalls = this.cachedCalls || {};

    var keys = (Object.keys || Ember.keys)(callbacks);
    var keysLength = keys.length;

    if (keysLength) {
      var deprecatedContext = this._buildDeprecatedContext(this, context);
      for (var i = 0; i < keysLength; i++) {
        this._contextualizeCallback(context, keys[i], deprecatedContext);
      }
    }
  },

  _contextualizeCallback: function(context, key, callbackContext) {
    var _this     = this;
    var callbacks = this.callbacks;
    var factory   = context.factory;

    context[key] = function(options) {
      if (_this.cachedCalls[key]) { return _this.cache[key]; }

      var result = callbacks[key].call(callbackContext, options, factory());

      _this.cache[key] = result;
      _this.cachedCalls[key] = true;

      return result;
    };
  },

  /*
    Builds a version of the passed in context that contains deprecation warnings
    for accessing properties that exist on the module.
  */
  _buildDeprecatedContext: function(module, context) {
    var deprecatedContext = Object.create(context);

    var keysForDeprecation = Object.keys(module);

    for (var i = 0, l = keysForDeprecation.length; i < l; i++) {
      this._proxyDeprecation(module, deprecatedContext, keysForDeprecation[i]);
    }

    return deprecatedContext;
  },

  /*
    Defines a key on an object to act as a proxy for deprecating the original.
  */
  _proxyDeprecation: function(obj, proxy, key) {
    if (typeof proxy[key] === 'undefined') {
      Object.defineProperty(proxy, key, {
        get: function() {
          Ember.deprecate('Accessing the test module property "' + key + '" from a callback is deprecated.', false, { id: 'ember-test-helpers.test-module.callback-context', until: '0.6.0' });
          return obj[key];
        }
      });
    }
  },

  _setupContainer: function(isolated) {
    var resolver = this.resolver;

    var items = buildRegistry(!isolated ? resolver : Object.create(resolver, {
      resolve: {
        value: function() {}
      }
    }));

    this.container = items.container;
    this.registry = items.registry;

    if (hasEmberVersion(1, 13)) {
      var thingToRegisterWith = this.registry || this.container;
      var router = resolver.resolve('router:main');
      router = router || Ember.Router.extend();
      thingToRegisterWith.register('router:main', router);
    }
  },

  _setupIsolatedContainer: function() {
    var resolver = this.resolver;
    this._setupContainer(true);

    var thingToRegisterWith = this.registry || this.container;

    for (var i = this.needs.length; i > 0; i--) {
      var fullName = this.needs[i - 1];
      var normalizedFullName = resolver.normalize(fullName);
      thingToRegisterWith.register(fullName, resolver.resolve(normalizedFullName));
    }

    if (!this.registry) {
      this.container.resolver = function() {};
    }
  },

  _setupIntegratedContainer: function() {
    this._setupContainer();
  }

});
