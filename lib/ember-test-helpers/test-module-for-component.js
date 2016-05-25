import TestModule from './test-module';
import Ember from 'ember';
import { getResolver } from './test-resolver';
import hasEmberVersion from './has-ember-version';

export default TestModule.extend({
  isComponentTestModule: true,

  init: function(componentName, description, callbacks) {
    // Allow `description` to be omitted
    if (!callbacks && typeof description === 'object') {
      callbacks = description;
      description = null;
    } else if (!callbacks) {
      callbacks = {};
    }

    this.componentName = componentName;

    if (callbacks.needs || callbacks.unit || callbacks.integration === false) {
      this.isUnitTest = true;
    } else if (callbacks.integration) {
      this.isUnitTest = false;
    } else {
      Ember.deprecate(
        "the component:" + componentName + " test module is implicitly running in unit test mode, " +
        "which will change to integration test mode by default in an upcoming version of " +
        "ember-test-helpers. Add `unit: true` or a `needs:[]` list to explicitly opt in to unit " +
        "test mode.",
        false,
        { id: 'ember-test-helpers.test-module-for-component.test-type', until: '0.6.0' }
      );
      this.isUnitTest = true;
    }

    if (description) {
      this._super.call(this, 'component:' + componentName, description, callbacks);
    } else {
      this._super.call(this, 'component:' + componentName, callbacks);
    }

    if (!this.isUnitTest && !this.isLegacy) {
      callbacks.integration = true;
    }

    if (this.isUnitTest || this.isLegacy) {
      this.setupSteps.push(this.setupComponentUnitTest);
    } else {
      this.callbacks.subject = function() {
        throw new Error("component integration tests do not support `subject()`. Instead, render the component as if it were HTML: `this.render('<my-component foo=true>');`. For more information, read: http://guides.emberjs.com/v2.2.0/testing/testing-components/");
      };
      this.setupSteps.push(this.setupComponentIntegrationTest);
      this.teardownSteps.unshift(this.teardownComponent);
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
      // in case `this.render` is called twice, make sure to teardown the first invocation
      module.teardownComponent();

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

  setupContext: function() {
    this._super.call(this);

    // only setup the injection if we are running against a version
    // of Ember that has `-view-registry:main` (Ember >= 1.12)
    if (this.container.lookupFactory('-view-registry:main')) {
      (this.registry || this.container).injection('component', '_viewRegistry', '-view-registry:main');
    }

    if (!this.isUnitTest && !this.isLegacy) {
      this.context.factory = function() {};
    }
  },

  teardownComponent: function() {
    var component = this.component;
    if (component) {
      Ember.run(component, 'destroy');
      this.component = null;
    }
  }
});
