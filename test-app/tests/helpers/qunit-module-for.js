import Ember from 'ember';
import { module } from 'qunit';
import QUnitTestAdapter from './qunit-test-adapter';

export default function qunitModuleFor(testModule) {
  module(testModule.name, {
    beforeEach(assert) {
      if (Ember.testing) {
        throw new Error('should not have Ember.testing === true in beforeEach');
      }
      Ember.Test.adapter = QUnitTestAdapter.create();
      testModule.setContext(this);
      return testModule.setup(assert).finally(() => {
        if (!Ember.testing) {
          throw new Error(
            'should have Ember.testing === true after tests have started'
          );
        }
      });
    },
    afterEach(assert) {
      return testModule.teardown(assert).finally(() => {
        Ember.Test.adapter = null;
        if (Ember.testing) {
          throw new Error(
            'should not have Ember.testing === true after tests have finished'
          );
        }
      });
    },
  });
}
