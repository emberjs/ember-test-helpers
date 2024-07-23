import {
  Backburner,
  DeferredActionQueues,
} from '@ember/runloop/-private/backburner';

export { setResolver, getResolver } from './resolver';
export { getApplication, setApplication } from './application';
export { default as hasEmberVersion } from './has-ember-version';
export type {
  BaseContext,
  DeprecationFailure,
  TestContext,
  Warning,
  SetupContextOptions,
} from './setup-context';
export {
  default as setupContext,
  getContext,
  setContext,
  unsetContext,
  pauseTest,
  resumeTest,
  getDeprecations,
  getDeprecationsDuringCallback,
  getWarnings,
  getWarningsDuringCallback,
} from './setup-context';
export { default as teardownContext } from './teardown-context';
export type { TeardownContextOptions } from './teardown-context';
export {
  default as setupRenderingContext,
  render,
  clearRender,
} from './setup-rendering-context';
export type { RenderingTestContext } from './setup-rendering-context';
export { default as rerender } from './rerender';
export {
  default as setupApplicationContext,
  visit,
  currentRouteName,
  currentURL,
} from './setup-application-context';
export { default as settled, isSettled, getSettledState } from './settled';
export { default as waitUntil } from './wait-until';
export { default as validateErrorHandler } from './validate-error-handler';
export { default as setupOnerror, resetOnerror } from './setup-onerror';
export type { default as DebugInfo } from './-internal/debug-info';
export { getDebugInfo } from './-internal/debug-info';
export { default as registerDebugInfoHelper } from './-internal/debug-info-helpers';
export type { TestMetadata } from './test-metadata';
export { default as getTestMetadata } from './test-metadata';
export {
  registerHook,
  runHooks,
  type Hook,
  type HookLabel,
  type HookUnregister,
} from './helper-hooks';

// DOM Helpers
export { default as click } from './dom/click';
export { default as doubleClick } from './dom/double-click';
export { default as tab } from './dom/tab';
export { default as tap } from './dom/tap';
export { default as focus } from './dom/focus';
export { default as blur } from './dom/blur';
export { default as triggerEvent } from './dom/trigger-event';
export { default as triggerKeyEvent } from './dom/trigger-key-event';
export { default as fillIn } from './dom/fill-in';
export { default as select } from './dom/select';
export { default as waitFor } from './dom/wait-for';
export { default as getRootElement } from './dom/get-root-element';
export { default as find } from './dom/find';
export { default as findAll } from './dom/find-all';
export { default as typeIn } from './dom/type-in';
export { default as scrollTo } from './dom/scroll-to';
export { default as dragMove } from './dom/drag-move';

export type { default as Target } from './dom/-target';

// Declaration-merge for our internal purposes.
declare module '@ember/runloop' {
  interface PrivateBackburner extends Backburner {
    hasTimers(): boolean;
    currentInstance: DeferredActionQueues | null;
  }
}
