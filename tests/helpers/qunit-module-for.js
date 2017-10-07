import Ember from 'ember';
import { module } from 'qunit';
import QUnitTestAdapter from './qunit-test-adapter';

export default function qunitModuleFor(testModule) {
  module(testModule.name, {
    beforeEach(assert) {
      Ember.Test.adapter = QUnitTestAdapter.create();
      testModule.setContext(this);
      return testModule.setup(assert);
    },
    afterEach(assert) {
      return testModule.teardown(assert);
    },
  });
}
