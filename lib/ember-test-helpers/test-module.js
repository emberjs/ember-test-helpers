import Ember from 'ember';
import { getContext, setContext, unsetContext } from './test-context';
import { Klass } from 'klassy';
import { getResolver } from './test-resolver';
import buildRegistry from './build-registry';
import hasEmberVersion from './has-ember-version';
import { _setupAJAXHooks, _teardownAJAXHooks } from './wait';

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

  setup: function() {
    var self = this;
    return self.invokeSteps(self.setupSteps).then(function() {
      self.contextualizeCallbacks();
      return self.invokeSteps(self.contextualizedSetupSteps, self.context);
    });
  },

  teardown: function() {
    var self = this;
    return self.invokeSteps(self.contextualizedTeardownSteps, self.context).then(function() {
      return self.invokeSteps(self.teardownSteps);
    }).then(function() {
      self.cache = null;
      self.cachedCalls = null;
    });
  },

  invokeSteps: function(steps, _context) {
    var context = _context;
    if (!context) {
      context = this;
    }
    steps = steps.slice();
    function nextStep() {
      var step = steps.shift();
      if (step) {
        // guard against exceptions, for example missing components referenced from needs.
        return new Ember.RSVP.Promise(function(ok) {
          ok(step.call(context));
        }).then(nextStep);
      } else {
        return Ember.RSVP.resolve();
      }
    }
    return nextStep();
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

    setContext({
      container:  this.container,
      registry: this.registry,
      factory:    factory,
      dispatcher: null,
      register: function() {
        var target = this.registry || this.container;
        return target.register.apply(target, arguments);
      },
      inject: {}
    });

    var context = this.context = getContext();

    if (Ember.setOwner) {
      Ember.setOwner(context, this.container.owner);
    }

    if (Ember.inject) {
      var keys = (Object.keys || Ember.keys)(Ember.inject);
      keys.forEach(function(typeName) {
        context.inject[typeName] = function(name, opts) {
          var alias = (opts && opts.as) || name;
          Ember.set(context, alias, context.container.lookup(typeName + ':' + name));
        };
      });
    }
  },

  setupTestElements: function() {
    if (Ember.$('#ember-testing').length === 0) {
      Ember.$('<div id="ember-testing"/>').appendTo(document.body);
    }
  },

  setupAJAXListeners: function() {
    _setupAJAXHooks();
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
    this.context = undefined;
    unsetContext();

    if (context.dispatcher && !context.dispatcher.isDestroyed) {
      Ember.run(function() {
        context.dispatcher.destroy();
      });
    }
  },

  teardownTestElements: function() {
    Ember.$('#ember-testing').empty();

    // Ember 2.0.0 removed Ember.View as public API, so only do this when
    // Ember.View is present
    if (Ember.View && Ember.View.views) {
      Ember.View.views = {};
    }
  },

  teardownAJAXListeners: function() {
    _teardownAJAXHooks();
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

    for (var i = 0, l = keys.length; i < l; i++) {
      this._contextualizeCallback(context, keys[i]);
    }
  },

  _contextualizeCallback: function(context, key) {
    var _this     = this;
    var callbacks = this.callbacks;
    var factory   = context.factory;

    context[key] = function(options) {
      if (_this.cachedCalls[key]) { return _this.cache[key]; }

      var result = callbacks[key].call(_this, options, factory());

      _this.cache[key] = result;
      _this.cachedCalls[key] = true;

      return result;
    };
  },

  _setupContainer: function(isolated) {
    var resolver = getResolver();

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
    var resolver = getResolver();
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
