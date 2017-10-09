export { default as TestModule } from './test-module';
export {
  default as TestModuleForAcceptance,
} from './test-module-for-acceptance';
export { default as TestModuleForComponent } from './test-module-for-component';
export { default as TestModuleForModel } from './test-module-for-model';
export { getContext, setContext, unsetContext } from './test-context';
export { setResolver } from './test-resolver';

import Ember from 'ember';
Ember.testing = true;
