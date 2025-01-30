import type { Backburner, DeferredActionQueues } from '@ember/runloop/-private/backburner';
export { setResolver, getResolver } from './resolver.ts';
export { getApplication, setApplication } from './application.ts';
export { default as hasEmberVersion } from './has-ember-version.ts';
export type { BaseContext, DeprecationFailure, TestContext, Warning, SetupContextOptions, } from './setup-context.ts';
export { default as setupContext, getContext, setContext, unsetContext, pauseTest, resumeTest, getDeprecations, getDeprecationsDuringCallback, getWarnings, getWarningsDuringCallback, } from './setup-context.ts';
export { default as teardownContext } from './teardown-context.ts';
export type { TeardownContextOptions } from './teardown-context.ts';
export { default as setupRenderingContext, render, clearRender, } from './setup-rendering-context.ts';
export type { RenderingTestContext } from './setup-rendering-context.ts';
export { default as rerender } from './rerender.ts';
export { default as setupApplicationContext, visit, currentRouteName, currentURL, } from './setup-application-context.ts';
export { default as settled, isSettled, getSettledState } from './settled.ts';
export { default as waitUntil } from './wait-until.ts';
export { default as validateErrorHandler } from './validate-error-handler.ts';
export { default as setupOnerror, resetOnerror } from './setup-onerror.ts';
export type { default as DebugInfo } from './-internal/debug-info.ts';
export { getDebugInfo } from './-internal/debug-info.ts';
export { default as registerDebugInfoHelper } from './-internal/debug-info-helpers.ts';
export type { TestMetadata } from './test-metadata.ts';
export { default as getTestMetadata } from './test-metadata.ts';
export { registerHook, runHooks, type Hook, type HookLabel, type HookUnregister, } from './helper-hooks.ts';
export { default as click } from './dom/click.ts';
export { default as doubleClick } from './dom/double-click.ts';
export { default as tab } from './dom/tab.ts';
export { default as tap } from './dom/tap.ts';
export { default as focus } from './dom/focus.ts';
export { default as blur } from './dom/blur.ts';
export { default as triggerEvent } from './dom/trigger-event.ts';
export { default as triggerKeyEvent } from './dom/trigger-key-event.ts';
export { default as fillIn } from './dom/fill-in.ts';
export { default as select } from './dom/select.ts';
export { default as waitFor } from './dom/wait-for.ts';
export { default as getRootElement } from './dom/get-root-element.ts';
export { default as find } from './dom/find.ts';
export { default as findAll } from './dom/find-all.ts';
export { default as typeIn } from './dom/type-in.ts';
export { default as scrollTo } from './dom/scroll-to.ts';
export type { Target } from './dom/-target.ts';
declare module '@ember/runloop' {
    interface PrivateBackburner extends Backburner {
        hasTimers(): boolean;
        currentInstance: DeferredActionQueues | null;
    }
}
//# sourceMappingURL=index.d.ts.map