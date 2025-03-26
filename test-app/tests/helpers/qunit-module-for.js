import { isTesting } from '@ember/debug';
import { module } from 'qunit';
import QUnitTestAdapter from './qunit-test-adapter';
import { setAdapter } from 'ember-testing/lib/setup_for_testing';

export default function qunitModuleFor(testModule) {
  module(testModule.name, {
    beforeEach(assert) {
      if (isTesting()) {
        throw new Error('should not have  isTesting() === true in beforeEach');
      }
      setAdapter(QUnitTestAdapter.create());
      testModule.setContext(this);
      return testModule.setup(assert).finally(() => {
        if (!isTesting()) {
          throw new Error(
            'should have Ember.testing === true after tests have started'
          );
        }
      });
    },
    afterEach(assert) {
      return testModule.teardown(assert).finally(() => {
        setAdapter(null);
        if (isTesting()) {
          throw new Error(
            'should not have Ember.testing === true after tests have finished'
          );
        }
      });
    },
  });
}
