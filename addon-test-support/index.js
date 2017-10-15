// TODO: deprecate these once new API is rolled out
export { default as TestModule } from './legacy-0-6-x/test-module';
export {
  default as TestModuleForAcceptance,
} from './legacy-0-6-x/test-module-for-acceptance';
export {
  default as TestModuleForComponent,
} from './legacy-0-6-x/test-module-for-component';
export {
  default as TestModuleForModel,
} from './legacy-0-6-x/test-module-for-model';
export {
  getContext,
  setContext,
  unsetContext,
} from './legacy-0-6-x/test-context';

export { setResolver } from './resolver';
export { default as setupContext } from './setup-context';
export { default as teardownContext } from './teardown-context';

import Ember from 'ember';
Ember.testing = true;
