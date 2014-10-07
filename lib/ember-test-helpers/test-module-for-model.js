import TestModule from './test-module';
import Ember from 'ember';

export default TestModule.extend({
  init: function(name, description, callbacks) {
    this.baseName = name;

    this._super.call(this, 'model:' + name, description, callbacks);

    this.setupSteps.push(this.setupModel);
  },

  setupModel: function() {
    var container = this.container;
    var defaultSubject = this.defaultSubject;
    var callbacks = this.callbacks;
    var baseName = this.baseName;

    if (DS._setupContainer) {
      DS._setupContainer(container);
    } else {
      container.register('store:main', DS.Store);
    }

    var adapterFactory = container.lookupFactory('adapter:application');
    if (!adapterFactory) {
      container.register('adapter:application', DS.FixtureAdapter);
    }

    callbacks.store = function(){
      return container.lookup('store:main');
    };

    if (callbacks.subject === defaultSubject) {
      callbacks.subject = function(options) {
        return Ember.run(function() {
          return container.lookup('store:main').createRecord(baseName, options);
        });
      };
    }
  }
});
