import TestModule from './test-module';
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

    if (callbacks.needs || callbacks.unit || callbacks.integration === false) {
      this.isUnitTest = true;
    } else if (callbacks.integration) {
      this.isUnitTest = false;
    } else {
      Ember.deprecate("the component:" + componentName + " test module is implicitly running in unit test mode, which will change to integration test mode by default in an upcoming version of ember-test-helpers. Add `unit: true` or a `needs:[]` list to explicitly opt in to unit test mode.");
      this.isUnitTest = true;
    }

    if (!this.isUnitTest) {
      callbacks.integration = true;
    }

    if (description) {
      this._super.call(this, 'component:' + componentName, description, callbacks);
    } else {
      this._super.call(this, 'component:' + componentName, callbacks);
    }

    if (this.isUnitTest) {
      this.setupSteps.push(this.setupComponentUnitTest);
    } else {
      this.callbacks.subject = function() {
        throw new Error("component integration tests do not support `subject()`.");
      };
      this.setupSteps.push(this.setupComponentIntegrationTest);
      this.teardownSteps.push(this.teardownComponent);
    }
  },

  setupComponentUnitTest: function() {
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

    container.register('application:main', {}, {instantiate: false});

    context.dispatcher = Ember.EventDispatcher.create();
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

  setupComponentIntegrationTest: function() {
    var self = this;
    var context = this.context;
    context.dispatcher = Ember.EventDispatcher.create();
    context.dispatcher.setup({}, '#ember-testing');
    this.actionHooks = {};

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
      self.component = Ember.View.create({
        context: context,
        controller: self,
        template: template,
        container: self.container
      });
      Ember.run(function() {
        self.component.appendTo('#ember-testing');
      });
    };

    context.$ = function() {
      return self.component.$.apply(self.component, arguments);
    };

    context.set = function(key, value) {
      Ember.run(function() {
        Ember.set(context, key, value);
      });
    };

    context.get = function(key) {
      return Ember.get(context, key);
    };

    context.on = function(actionName, handler) {
      self.actionHooks[actionName] = handler;
    };

  },

  setupContext: function() {
    this._super.call(this);
    if (!this.isUnitTest) {
      this.context.factory = function() {};
    }
  },


  send: function(actionName) {
    var hook = this.actionHooks[actionName];
    if (!hook) {
      throw new Error("integration testing template received unexpected action " + actionName);
    }
    hook.apply(this, Array.prototype.slice.call(arguments, 1));
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
