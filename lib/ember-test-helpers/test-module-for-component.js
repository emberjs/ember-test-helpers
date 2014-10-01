import TestModule from './test-module';
import Ember from 'ember';
import { getResolver } from './test-resolver';

function TestModuleForComponent(name, description, callbacks) {
  var module = this.module = new TestModule('component:' + name, description, callbacks);

  this.name = module.name;

  module.setupSteps.push(function() {
    var resolver = getResolver();
    var container = this.container;
    var context = this.context;

    var layoutName = 'template:components/' + name;

    var layout = resolver.resolve(layoutName);

    if (layout) {
      container.register(layoutName, layout);
      container.injection('component:' + name, 'layout', layoutName);
    }

    context.dispatcher = Ember.EventDispatcher.create();
    context.dispatcher.setup({}, '#ember-testing');

    module.callbacks.render = function() {
      var containerView = Ember.ContainerView.create({container: container});
      var view = Ember.run(function(){
        var subject = context.subject();
        containerView.pushObject(subject);
        containerView.appendTo('#ember-testing');
        return subject;
      });

      module.teardownSteps.push(function() {
        Ember.run(function() {
          Ember.tryInvoke(containerView, 'destroy');
        });
      });

      return view.$();
    };

    module.callbacks.append = function() {
      Ember.deprecate('this.append() is deprecated. Please use this.render() instead.');
      return this.render();
    };

    context.$ = function(){
      var $view = this.render();
      var subject = this.subject();

      if (arguments.length){
        return subject.$.apply(subject, arguments);
      } else {
        return $view;
      }
    };
  });
}

TestModuleForComponent.prototype = {
  setup: function() {
    this.module.setup.call(this.module);
  },

  teardown: function() {
    this.module.teardown.call(this.module);
  }
}

export default TestModuleForComponent;
