import Ember from 'ember';
import TestModule from './test-module';
import { getResolver } from './test-resolver';
import { getContext, setContext } from './test-context';

export default TestModule.extend({
  init: function(name, description, callbacks) {
    this._super.call(this, name, description, callbacks);
    this.setupSteps.push(this.setupIntegrationHelpers);
    this.teardownSteps.push(this.teardownView);
  },

  setupIntegrationHelpers: function() {
    var self = this;
    var context = this.context;
    context.dispatcher = Ember.EventDispatcher.create();
    context.dispatcher.setup({}, '#ember-testing');
    this.actionHooks = {};

    context.render = function(templateString) {
      if (Ember.isArray(templateString)) {
        templateString = templateString.join('');
      }
      self.view = Ember.View.create({
        context: self,
        controller: self,
        template: Ember.Handlebars.compile(templateString),
        container: self.container
      });
      Ember.run(function() {
        self.view.appendTo('#ember-testing');
      });
    };

    context.$ = function() {
      return self.view.$.apply(self.view, arguments);
    };

    context.set = function(key, value) {
      Ember.run(function() {
        Ember.set(self, key, value);
      });
    };

    context.get = function(key) {
      return Ember.get(self, key);
    };

    context.on = function(actionName, handler) {
      self.actionHooks[actionName] = handler;
    };

  },

  setupContainer: function() {
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

  setupContext: function() {

    setContext({
      container:  this.container,
      factory: function() {},
      dispatcher: null
    });

    this.context = getContext();
  },

  send: function(actionName) {
    var hook = this.actionHooks[actionName];
    if (!hook) {
      throw new Error("integration testing template received unexpected action " + actionName);
    }
    hook.apply(this, Array.prototype.slice.call(arguments, 1));
  },

  teardownView: function() {
    var view = this.view;
    if (view) {
      Ember.run(function() {
        view.destroy();
      });
    }
  }

});
