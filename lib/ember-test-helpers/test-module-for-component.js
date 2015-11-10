import { default as TestModule, UNIT_TEST, LEGACY_INTEGRATION_TEST, INTEGRATION_TEST } from './test-module';
import Ember from 'ember';
import { getResolver } from './test-resolver';

export default TestModule.extend({
  init: function(componentName, description, callbacks) {
    // Allow `description` to be omitted
    if (!callbacks && typeof description === 'object') {
      callbacks = description;
      description = null;
    } else if (!callbacks) {
      callbacks = {};
    }

    this.componentName = componentName;

    if (! (callbacks.needs || callbacks.unit) && this.isUnitTest()) {
      Ember.deprecate(
        "the component:" + componentName + " test module is implicitly running in unit test mode, " +
        "which will change to integration test mode by default in an upcoming version of " +
        "ember-test-helpers. Add `unit: true` or a `needs:[]` list to explicitly opt in to unit " +
        "test mode.",
        false,
        { id: 'ember-test-helpers.test-module-for-component.test-type', until: '0.6.0' }
      );
    }

    if (description) {
      this._super.call(this, 'component:' + componentName, description, callbacks);
    } else {
      this._super.call(this, 'component:' + componentName, callbacks);
    }

    switch (this.testType) {
      case UNIT_TEST:
        this.setupSteps.push(this.setupComponentUnitTest);
        break;
      case LEGACY_INTEGRATION_TEST:
        this.setupSteps.push(this.setupLegacyComponentTest);
        this.setupSteps.push(this.setupComponentLegacyIntegrationTest);
        break;
      case INTEGRATION_TEST:
        this.callbacks.subject = function() {
          throw new Error("component integration tests do not support `subject()`.");
        };
        this.setupSteps.push(this.setupComponentIntegrationTest);
        this.teardownSteps.unshift(this.teardownComponent);
        break;
      default:
        throw new Error("Unexted test type `" + this.testType + "`");
    }

    if (Ember.View && Ember.View.views) {
      this.setupSteps.push(this._aliasViewRegistry);
      this.teardownSteps.unshift(this._resetViewRegistry);
    }
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
  },

  setupComponentUnitTest: function() {
    var _this = this;
    var resolver = getResolver();
    var context = this.context;

    var layoutName = 'template:components/' + this.componentName;

    var layout = resolver.resolve(layoutName);

    var thingToRegisterWith = this.registry || this.container;
    if (layout) {
      thingToRegisterWith.register(layoutName, layout);
      thingToRegisterWith.injection(this.subjectName, 'layout', layoutName);
    }

    context.dispatcher = this.container.lookup('event_dispatcher:main') || Ember.EventDispatcher.create();
    context.dispatcher.setup({}, '#ember-testing');

    this.callbacks.render = function() {
      var subject;

      Ember.run(function(){
        subject = context.subject();
        subject.appendTo('#ember-testing');
      });

      _this.teardownSteps.unshift(function() {
        Ember.run(function() {
          Ember.tryInvoke(subject, 'destroy');
        });
      });
    };

    this.callbacks.append = function() {
      Ember.deprecate(
        'this.append() is deprecated. Please use this.render() or this.$() instead.',
        false,
        { id: 'ember-test-helpers.test-module-for-component.append', until: '0.6.0' }
      );
      return context.$();
    };

    context.$ = function() {
      this.render();
      var subject = this.subject();

      return subject.$.apply(subject, arguments);
    };
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
      Ember.run(function() {
        Ember.set(context, key, value);
      });
    };

    context.setProperties = function(hash) {
      Ember.run(function() {
        Ember.setProperties(context, hash);
      });
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
  },

  setupComponentLegacyIntegrationTest: function () {
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
  },

  setupLegacyComponentTest: function () {
    var _this = this;
    var resolver = getResolver();
    var container = this.container;
    var context = this.context;

    var layoutName = 'template:components/' + this.componentName;

    var layout = resolver.resolve(layoutName);

    if (layout) {
      container.register(layoutName, layout);
      container.injection(this.subjectName, 'layout', layoutName);
    }

    context.dispatcher = this.container.lookup('event_dispatcher:main') || Ember.EventDispatcher.create();
    context.dispatcher.setup({}, '#ember-testing');

    this.callbacks.render = function() {
      var containerView = Ember.ContainerView.create({container: container});
      Ember.run(function(){
        var subject = context.subject();
        containerView.pushObject(subject);
        containerView.appendTo('#ember-testing');
      });

      _this.teardownSteps.unshift(function() {
        Ember.run(function() {
          Ember.tryInvoke(containerView, 'destroy');
        });
      });
    };

    this.callbacks.append = function() {
      Ember.deprecate('this.append() is deprecated. Please use this.render() or this.$() instead.');
      return context.$();
    };

    context.$ = function() {
      this.render();
      var subject = this.subject();

      return subject.$.apply(subject, arguments);
    };
  },

  setupContext: function() {
    this._super.call(this);

    // only setup the injection if we are running against a version
    // of Ember that has `-view-registry:main` (Ember >= 1.12)
    if (this.container.lookupFactory('-view-registry:main')) {
      (this.registry || this.container).injection('component', '_viewRegistry', '-view-registry:main');
    }

    if (this.isIntegrationTest()) {
      this.context.factory = function() {};
    }
  },

  teardownComponent: function() {
    var component = this.component;
    if (component) {
      Ember.run(function() {
        component.destroy();
      });
    }
  }
});
