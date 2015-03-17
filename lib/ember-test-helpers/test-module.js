import Ember from 'ember';
import isolatedContainer from './isolated-container';
import { getContext, setContext } from './test-context';
import { Klass } from 'klassy';
import { getResolver } from './test-resolver';

export default Klass.extend({
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

    if (this.callbacks.integration) {
      this.isIntegration = callbacks.integration;      
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
      this.needs = this.needs.concat(this.callbacks.needs)
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

    if (this.callbacks.afterTeardown) {
      this.teardownSteps.push( this.callbacks.afterTeardown );
      delete this.callbacks.afterTeardown;
    }
  },

  setup: function() {
    this.invokeSteps(this.setupSteps);
    this.contextualizeCallbacks();
    this.invokeSteps(this.contextualizedSetupSteps, this.context);
  },

  teardown: function() {
    this.invokeSteps(this.contextualizedTeardownSteps, this.context);
    this.invokeSteps(this.teardownSteps);
    this.cache = null;
    this.cachedCalls = null;
  },

  invokeSteps: function(steps, _context) {
    var context = _context;
    if (!context) {
      context = this;
    }

    for (var i = 0, l = steps.length; i < l; i++) {
      steps[i].call(context);
    }
  },

  setupContainer: function() {
    if (this.isIntegration) {
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

    setContext({
      container:  this.container,
      factory:    factory,
      dispatcher: null
    });

    this.context = getContext();
  },

  setupTestElements: function() {
    if (Ember.$('#ember-testing').length === 0) {
      Ember.$('<div id="ember-testing"/>').appendTo(document.body);
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

  teardownContext: function() {
    var context = this.context;
    if (context.dispatcher) {
      Ember.run(function() {
        context.dispatcher.destroy();
      });
    }
  },

  teardownTestElements: function() {
    Ember.$('#ember-testing').empty();
    Ember.View.views = {};
  },

  defaultSubject: function(options, factory) {
    return factory.create(options);
  },

  // allow arbitrary named factories, like rspec let
  contextualizeCallbacks: function() {
    var _this     = this;
    var callbacks = this.callbacks;
    var context   = this.context;
    var factory   = context.factory;

    this.cache = this.cache || {};
    this.cachedCalls = this.cachedCalls || {};

    var keys = Ember.keys(callbacks);

    for (var i = 0, l = keys.length; i < l; i++) {
      (function(key) {

        context[key] = function(options) {
          if (_this.cachedCalls[key]) { return _this.cache[key]; }

          var result = callbacks[key].call(_this, options, factory());

          _this.cache[key] = result;
          _this.cachedCalls[key] = true;

          return result;
        };

      })(keys[i]);
    }
  },


  _setupIsolatedContainer: function() {
    this.container = isolatedContainer(this.needs);
  },

  _setupIntegratedContainer: function() {
    var resolver = getResolver();
    var namespace = Ember.Object.create({
      Resolver: { create: function() { return resolver; } }
    });

    if (Ember.Application.buildRegistry) {
      var registry;
      registry = Ember.Application.buildRegistry(namespace);
      registry.register('component-lookup:main', Ember.ComponentLookup);
      this.registry = registry;
      this.container = registry.container();
    } else {
      this.container = Ember.Application.buildContainer(namespace);
      this.container.register('component-lookup:main', Ember.ComponentLookup);
    }
  }

});

