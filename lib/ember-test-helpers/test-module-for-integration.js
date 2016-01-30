import Ember from 'ember';
import { getContext } from './test-context';
import AbstractTestModule from './abstract-test-module';
import { getResolver } from './test-resolver';
import buildRegistry from './build-registry';
import hasEmberVersion from './has-ember-version';

export default AbstractTestModule.extend({
  initSetupSteps() {
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
    this.setupSteps.push(this.setupComponentIntegrationTest);

    if (Ember.View && Ember.View.views) {
      this.setupSteps.push(this._aliasViewRegistry);
    }

    if (this.callbacks.setup) {
      this.contextualizedSetupSteps.push(this.callbacks.setup);
      delete this.callbacks.setup;
    }
  },

  initTeardownSteps() {
    this.teardownSteps = [];
    this.contextualizedTeardownSteps = [];

    if (this.callbacks.teardown) {
      this.contextualizedTeardownSteps.push( this.callbacks.teardown );
      delete this.callbacks.teardown;
    }

    this.teardownSteps.push(this.teardownContainer);
    this.teardownSteps.push(this.teardownContext);
    this.teardownSteps.push(this.teardownAJAXListeners);
    this.teardownSteps.push(this.teardownComponent);

    if (Ember.View && Ember.View.views) {
      this.teardownSteps.push(this._resetViewRegistry);
    }

    this.teardownSteps.push(this.teardownTestElements);

    if (this.callbacks.afterTeardown) {
      this.teardownSteps.push(this.callbacks.afterTeardown);
      delete this.callbacks.afterTeardown;
    }
  },

  setupContainer() {
    var resolver = getResolver();
    var items = buildRegistry(resolver);

    this.container = items.container;
    this.registry = items.registry;

    if (hasEmberVersion(1, 13)) {
      var thingToRegisterWith = this.registry || this.container;
      var router = resolver.resolve('router:main');
      router = router || Ember.Router.extend();
      thingToRegisterWith.register('router:main', router);
    }
  },

  setupContext() {
    var subjectName = this.subjectName;
    var container = this.container;

    var factory = function() {
      return container.lookupFactory(subjectName);
    };

    this._super({
      container:  this.container,
      registry: this.registry,
      factory:    factory,
      register() {
        var target = this.registry || this.container;
        return target.register.apply(target, arguments);
      },
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

    // only setup the injection if we are running against a version
    // of Ember that has `-view-registry:main` (Ember >= 1.12)
    if (this.container.lookupFactory('-view-registry:main')) {
      (this.registry || this.container).injection('component', '_viewRegistry', '-view-registry:main');
    }
  },

  setupComponentIntegrationTest: function() {
    var module = this;
    var context = this.context;

    this.actionHooks = {};

    context.dispatcher = this.container.lookup('event_dispatcher:main') || Ember.EventDispatcher.create();
    context.dispatcher.setup({}, '#ember-testing');
    context.actions = module.actionHooks;

    (this.registry || this.container).register('component:-test-holder', Ember.Component.extend());

    context.render = function(template) {
      if (!template) {
        throw new Error("in a component integration test you must pass a template to `render()`");
      }
      if (Ember.isArray(template)) {
        template = template.join('');
      }
      if (typeof template === 'string') {
        template = Ember.Handlebars.compile(template);
      }
      module.component = module.container.lookupFactory('component:-test-holder').create({
        layout: template
      });

      module.component.set('context' ,context);
      module.component.set('controller', context);

      Ember.run(function() {
        module.component.appendTo('#ember-testing');
      });
    };

    context.$ = function() {
      return module.component.$.apply(module.component, arguments);
    };

    context.set = function(key, value) {
      var ret = Ember.run(function() {
        return Ember.set(context, key, value);
      });

      if (hasEmberVersion(2,0)) {
        return ret;
      }
    };

    context.setProperties = function(hash) {
      var ret = Ember.run(function() {
        return Ember.setProperties(context, hash);
      });

      if (hasEmberVersion(2,0)) {
        return ret;
      }
    };

    context.get = function(key) {
      return Ember.get(context, key);
    };

    context.getProperties = function() {
      var args = Array.prototype.slice.call(arguments);
      return Ember.getProperties(context, args);
    };

    context.on = function(actionName, handler) {
      module.actionHooks[actionName] = handler;
    };

    context.send = function(actionName) {
      var hook = module.actionHooks[actionName];
      if (!hook) {
        throw new Error("integration testing template received unexpected action " + actionName);
      }
      hook.apply(module, Array.prototype.slice.call(arguments, 1));
    };

    context.clearRender = function() {
      module.teardownComponent();
    };
  },

  teardownComponent: function() {
    var component = this.component;
    if (component) {
      Ember.run(function() {
        component.destroy();
      });
    }
  },

  teardownContainer() {
    var container = this.container;
    Ember.run(function() {
      container.destroy();
    });
  },

  // allow arbitrary named factories, like rspec let
  contextualizeCallbacks() {
    var callbacks = this.callbacks;
    var context   = this.context;

    this.cache = this.cache || {};
    this.cachedCalls = this.cachedCalls || {};

    var keys = (Object.keys || Ember.keys)(callbacks);
    var keysLength = keys.length;

    if (keysLength) {
      for (var i = 0; i < keysLength; i++) {
        this._contextualizeCallback(context, keys[i], context);
      }
    }
  },

  _contextualizeCallback(context, key, callbackContext) {
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

  _aliasViewRegistry: function() {
    this._originalGlobalViewRegistry = Ember.View.views;
    var viewRegistry = this.container.lookup('-view-registry:main');

    if (viewRegistry) {
      Ember.View.views = viewRegistry;
    }
  },

  _resetViewRegistry: function() {
    Ember.View.views = this._originalGlobalViewRegistry;
  }
});
