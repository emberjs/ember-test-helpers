import Ember                  from 'ember';
import { isolatedContainer }  from 'ember-test-helpers/isolated-container';
import TestModule             from 'ember-test-helpers/test-module';
import TestModuleForComponent from 'ember-test-helpers/test-module-for-component';
import TestModuleForModel     from 'ember-test-helpers/test-module-for-model';
import { getContext, setContext } from 'ember-test-helpers/test-context';
import { setResolver } from 'ember-test-helpers/test-resolver';

Ember.testing = true;

export {
  isolatedContainer,
  TestModule,
  TestModuleForComponent,
  TestModuleForModel,
  getContext,
  setContext,
  setResolver
};
