import TestModule from './test-module';
import Ember from 'ember';
import { getResolver } from './test-resolver';

export default TestModule.extend({
  init: function(componentName, description, callbacks) {
    this.componentName = componentName;

    this._super.call(this, 'component:' + componentName, description, callbacks);

    this.setupSteps.push(this.setupComponent);
  },

  setupComponent: function() {
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
  }
});
