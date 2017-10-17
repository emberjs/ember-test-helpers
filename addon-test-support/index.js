// TODO: deprecate these once new API is rolled out
export { default as TestModule } from './legacy-0-6-x/test-module';
export { default as TestModuleForAcceptance } from './legacy-0-6-x/test-module-for-acceptance';
export { default as TestModuleForComponent } from './legacy-0-6-x/test-module-for-component';
export { default as TestModuleForModel } from './legacy-0-6-x/test-module-for-model';

export { setResolver } from './resolver';
export { default as setupContext, getContext, setContext, unsetContext } from './setup-context';
export { default as teardownContext } from './teardown-context';
export { default as setupRenderingContext, render, clearRender } from './setup-rendering-context';
export { default as teardownRenderingContext } from './teardown-rendering-context';

import Ember from 'ember';
Ember.testing = true;
