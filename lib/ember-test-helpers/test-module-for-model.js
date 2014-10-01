import TestModule from './test-module';
import Ember from 'ember';

function TestModuleForModel(name, description, callbacks) {
  if (!DS) throw new Error('You must have Ember Data installed to use `moduleForModel`.');

  var module = this.module = new TestModule('model:' + name, description, callbacks);

  module.setupSteps.push(function() {
    var container = this.container;
    var context = this.context;
    var defaultSubject = this.defaultSubject;

    if (DS._setupContainer) {
      DS._setupContainer(container);
    } else {
      container.register('store:main', DS.Store);
    }

    var adapterFactory = container.lookupFactory('adapter:application');
    if (!adapterFactory) {
      container.register('adapter:application', DS.FixtureAdapter);
    }

    module.callbacks.store = function(){
      return container.lookup('store:main');
    };

    if (module.callbacks.subject === defaultSubject) {
      module.callbacks.subject = function(options) {
        return Ember.run(function() {
          return container.lookup('store:main').createRecord(name, options);
        });
      };
    }
  });
}

TestModuleForModel.prototype = {
  setup: function() {
    this.module.setup.call(this.module);
  },

  teardown: function() {
    this.module.teardown.call(this.module);
  }
}

export default TestModuleForModel;
