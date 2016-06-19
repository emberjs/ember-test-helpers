import Ember from 'ember';
import TestModule from 'ember-test-helpers/test-module';
import TestModuleForAcceptance from 'ember-test-helpers/test-module-for-acceptance';
import TestModuleForIntegration from 'ember-test-helpers/test-module-for-integration';
import TestModuleForComponent from 'ember-test-helpers/test-module-for-component';
import TestModuleForModel from 'ember-test-helpers/test-module-for-model';
import { getContext, setContext, unsetContext } from 'ember-test-helpers/test-context';
import { setResolver } from 'ember-test-helpers/test-resolver';

Ember.testing = true;

export {
  TestModule,
  TestModuleForAcceptance,
  TestModuleForIntegration,
  TestModuleForComponent,
  TestModuleForModel,
  getContext,
  setContext,
  unsetContext,
  setResolver
};
