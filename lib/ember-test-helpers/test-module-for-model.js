import TestModule from './test-module';
import Ember from 'ember';

export default TestModule.extend({
  init: function(modelName, description, callbacks) {
    this.modelName = modelName;

    this._super.call(this, 'model:' + modelName, description, callbacks);

    this.setupSteps.push(this.setupModel);
  },

  setupModel: function() {
    var container = this.container;
    var defaultSubject = this.defaultSubject;
    var callbacks = this.callbacks;
    var modelName = this.modelName;

    var adapterFactory = container.lookupFactory('adapter:application');
    if (!adapterFactory) {
      container.register('adapter:application', DS.FixtureAdapter);
    }

    callbacks.store = function(){
      var container = this.container;
      var store = container.lookup('service:store') || container.lookup('store:main');
      return store;
    };

    if (callbacks.subject === defaultSubject) {
      callbacks.subject = function(options) {
        var container = this.container;

        return Ember.run(function() {
          var store = container.lookup('service:store') || container.lookup('store:main');
          return store.createRecord(modelName, options);
        });
      };
    }
  }
});
