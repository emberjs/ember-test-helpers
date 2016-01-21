import AbstractTestModule from './abstract-test-module';
import Ember from 'ember';
import { getContext } from './test-context';

export default AbstractTestModule.extend({
  setupContext() {
    this._super({ application: this.createApplication() });
  },

  teardownContext() {
    Ember.run(() => {
      getContext().application.destroy();
    });

    this._super();
  },

  createApplication() {
    let { Application, config } = this.callbacks;
    let application;

    Ember.run(() => {
      application = Application.create(config);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }
});
