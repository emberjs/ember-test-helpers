import isolatedContainer from './isolated-container';
import { getContext, setContext } from './test-context';
import { Klass } from 'klassy';

export default Klass.extend({
  init: function(fullName, description, callbacks) {
    // Allow `description` to be omitted, in which case it should
    // be set to `fullName`
    if (!callbacks && typeof description === 'object') {
      callbacks = description;
      description = fullName;
    }

    this.fullName = fullName;
    this.description = description || fullName;
    this.name = description || fullName;
    this.callbacks = callbacks || {};

    this.initSubject();
    this.initNeeds();
    this.initSetupSteps();
    this.initTeardownSteps();
  },

  initSubject: function() {
    this.callbacks.subject = this.callbacks.subject || this.defaultSubject;
  },

  initNeeds: function() {
    this.needs = [this.fullName];
    if (this.callbacks.needs) {
      this.needs = this.needs.concat(this.callbacks.needs)
      delete this.callbacks.needs;
    }
  },

  initSetupSteps: function() {
    this.setupSteps = [];

    if (this.callbacks.beforeSetup) {
      this.setupSteps.push( this.callbacks.beforeSetup );
      delete this.callbacks.beforeSetup;
    }

    this.setupSteps.push(this.setupContainer);
    this.setupSteps.push(this.setupContext);
    this.setupSteps.push(this.setupTestElements);

    if (this.callbacks.setup) {
      this.setupSteps.push( this.callbacks.setup );
      delete this.callbacks.setup;
    }
  },

  initTeardownSteps: function() {
    this.teardownSteps = [];

    if (this.callbacks.beforeTeardown) {
      this.teardownSteps.push( this.callbacks.beforeTeardown );
      delete this.callbacks.beforeTeardown;
    }

    this.teardownSteps.push(this.teardownContainer);
    this.teardownSteps.push(this.teardownContext);
    this.teardownSteps.push(this.teardownTestElements);

    if (this.callbacks.teardown) {
      this.teardownSteps.push( this.callbacks.teardown );
      delete this.callbacks.teardown;
    }
  },

  setup: function() {
    this.invokeSteps(this.setupSteps);
    this.contextualizeCallbacks();
  },

  teardown: function() {
    this.invokeSteps(this.teardownSteps);
    this.cache = null;
  },

  invokeSteps: function(steps) {
    for (var i = 0, l = steps.length; i < l; i++) {
      steps[i].call(this);
    }
  },

  setupContainer: function() {
    this.container = isolatedContainer(this.needs);
  },

  setupContext: function() {
    var fullName = this.fullName;
    var container = this.container;

    var factory = function() {
      return container.lookupFactory(fullName);
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

    var keys = Ember.keys(callbacks);

    for (var i = 0, l = keys.length; i < l; i++) {
      (function(key) {

        context[key] = function(options) {
          if (_this.cache[key]) { return _this.cache[key]; }

          var result = callbacks[key](options, factory());
          _this.cache[key] = result;

          return result;
        };

      })(keys[i]);
    }
  }
});

