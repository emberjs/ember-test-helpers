import { expectTypeOf } from 'expect-type';

import {
  // DOM Interaction Helpers
  blur,
  click,
  doubleClick,
  fillIn,
  focus,
  scrollTo,
  select,
  tab,
  tap,
  triggerEvent,
  triggerKeyEvent,
  typeIn,
  // DOM Query Helpers
  find,
  findAll,
  getRootElement,
  // Routing Helpers
  visit,
  currentRouteName,
  currentURL,
  // Rendering Helpers
  render,
  rerender,
  clearRender,
  // Wait Helpers
  waitFor,
  waitUntil,
  settled,
  isSettled,
  getSettledState,
  // Pause Helpers
  pauseTest,
  resumeTest,
  // Debug Helpers
  getDebugInfo,
  registerDebugInfoHelper,
  // Test Framework APIs
  setResolver,
  getResolver,
  setupContext,
  getContext,
  setContext,
  unsetContext,
  teardownContext,
  setupRenderingContext,
  RenderingTestContext,
  getApplication,
  setApplication,
  setupApplicationContext,
  validateErrorHandler,
  setupOnerror,
  resetOnerror,
  getTestMetadata,
  // deprecation and warning APIs
  getDeprecations,
  getDeprecationsDuringCallback,
  getWarnings,
  getWarningsDuringCallback,
  BaseContext,
  TestContext,
  TestMetadata,
  DebugInfo as InternalDebugInfo,
  DeprecationFailure,
  Warning,
  Target,
  // Helper hooks
  registerHook,
  runHooks,
  type Hook,
  type HookLabel,
  type HookUnregister,
} from '@ember/test-helpers';
import { ComponentInstance } from '@glimmer/interfaces';
import { Owner } from '@ember/test-helpers/build-owner';
import { DebugInfo as BackburnerDebugInfo } from '@ember/runloop/-private/backburner';
import type { Resolver as EmberResolver } from '@ember/owner';
import Application from '@ember/application';
import { TemplateFactory } from 'ember-cli-htmlbars';

// DOM Interaction Helpers
expectTypeOf(blur).toEqualTypeOf<(target?: Target) => Promise<void>>();
expectTypeOf(click).toEqualTypeOf<
  (target: Target, options?: MouseEventInit) => Promise<void>
>();
expectTypeOf(doubleClick).toEqualTypeOf<
  (target: Target, options?: MouseEventInit) => Promise<void>
>();
expectTypeOf(fillIn).toEqualTypeOf<
  (target: Target, text: string) => Promise<void>
>();
expectTypeOf(focus).toEqualTypeOf<(target: Target) => Promise<void>>();
expectTypeOf(scrollTo).toEqualTypeOf<
  (target: string | HTMLElement, x: number, y: number) => Promise<void>
>();
expectTypeOf(select).toEqualTypeOf<
  (
    target: Target,
    options: string | string[],
    keepPreviouslySelected?: boolean
  ) => Promise<void>
>();
expectTypeOf(tab).toEqualTypeOf<
  ({
    backwards,
    unRestrainTabIndex,
  }?: {
    backwards?: boolean | undefined;
    unRestrainTabIndex?: boolean | undefined;
  }) => Promise<void>
>();
expectTypeOf(tap).toEqualTypeOf<
  (target: Target, options?: TouchEventInit) => Promise<void>
>();
expectTypeOf(triggerEvent).toEqualTypeOf<
  (
    target: Target,
    eventType: string,
    options?: Record<string, unknown>
  ) => Promise<void>
>();
expectTypeOf(triggerKeyEvent).toEqualTypeOf<
  (
    target: Target,
    eventType: 'keydown' | 'keyup' | 'keypress',
    key: number | string,
    modifiers?: {
      ctrlKey?: boolean;
      altKey?: boolean;
      shiftKey?: boolean;
      metaKey?: boolean;
    }
  ) => Promise<void>
>();
expectTypeOf(typeIn).toEqualTypeOf<
  (
    target: Target,
    text: string,
    options?: {
      delay?: number;
    }
  ) => Promise<void>
>();

// DOM Query Helpers
expectTypeOf(find).toEqualTypeOf<Document['querySelector']>();
expectTypeOf(find('a')).toEqualTypeOf<HTMLAnchorElement | SVGAElement | null>();
expectTypeOf(find('div')).toEqualTypeOf<HTMLDivElement | null>();
expectTypeOf(find('circle')).toEqualTypeOf<SVGCircleElement | null>();
expectTypeOf(find('.corkscrew')).toEqualTypeOf<Element | null>();
expectTypeOf(findAll).toEqualTypeOf<(selector: string) => Array<Element>>();
expectTypeOf(findAll('a')).toEqualTypeOf<(HTMLAnchorElement | SVGAElement)[]>();
expectTypeOf(findAll('div')).toEqualTypeOf<HTMLDivElement[]>();
expectTypeOf(findAll('circle')).toEqualTypeOf<SVGCircleElement[]>();
expectTypeOf(findAll('.corkscrew')).toEqualTypeOf<Element[]>();
expectTypeOf(getRootElement).toEqualTypeOf<() => Element | Document>();

// Routing Helpers
expectTypeOf(visit).toEqualTypeOf<
  (url: string, options?: Record<string, unknown>) => Promise<void>
>();
expectTypeOf(currentRouteName).toEqualTypeOf<() => string>();
expectTypeOf(currentURL).toEqualTypeOf<() => string>();

// Rendering Helpers
expectTypeOf(render).toMatchTypeOf<
  (templateOrComponent: object, options?: { owner?: Owner }) => Promise<void>
>();
expectTypeOf(rerender).toMatchTypeOf<() => Promise<void>>();
expectTypeOf(clearRender).toEqualTypeOf<() => Promise<void>>();

// Wait Helpers
expectTypeOf(waitFor).toEqualTypeOf<
  (
    selector: string,
    options?: {
      timeout?: number;
      count?: number | null;
      timeoutMessage?: string;
    }
  ) => Promise<Element | Array<Element>>
>();
expectTypeOf(waitUntil).toEqualTypeOf<
  <T>(
    callback: () => T | void | false | 0 | '' | null | undefined,
    options?: {
      timeout?: number;
      timeoutMessage?: string;
    }
  ) => Promise<T>
>();
expectTypeOf(settled).toEqualTypeOf<() => Promise<void>>();
expectTypeOf(isSettled).toEqualTypeOf<() => boolean>();
expectTypeOf(getSettledState).toEqualTypeOf<
  () => {
    hasRunLoop: boolean;
    hasPendingTimers: boolean;
    hasPendingWaiters: boolean;
    hasPendingRequests: boolean;
    hasPendingTransitions: boolean | null;
    isRenderPending: boolean;
    pendingRequestCount: number;
    debugInfo: InternalDebugInfo;
  }
>();

// Pause Helpers
expectTypeOf(pauseTest).toEqualTypeOf<() => Promise<void>>();
expectTypeOf(resumeTest).toEqualTypeOf<() => void>();

// Debug Helpers
expectTypeOf(getDebugInfo).toEqualTypeOf<() => BackburnerDebugInfo | null>();
expectTypeOf(registerDebugInfoHelper).toEqualTypeOf<
  (debugInfoHelper: { name: string; log: () => void }) => void
>();

// Test Framework APIs
expectTypeOf(setResolver).toEqualTypeOf<(resolver: EmberResolver) => void>();
expectTypeOf(getResolver).toEqualTypeOf<() => EmberResolver | undefined>();
expectTypeOf(setupContext).toEqualTypeOf<
  (
    context: BaseContext,
    options?: { resolver?: EmberResolver }
  ) => Promise<TestContext>
>();
expectTypeOf(getContext).toEqualTypeOf<() => BaseContext | undefined>();
expectTypeOf(setContext).toEqualTypeOf<(context: BaseContext) => void>();
expectTypeOf(unsetContext).toEqualTypeOf<() => void>();
expectTypeOf(teardownContext).toEqualTypeOf<
  (
    context: TestContext,
    options?: { waitForSettled?: boolean }
  ) => Promise<void>
>();
expectTypeOf(setupRenderingContext).toEqualTypeOf<
  (context: TestContext) => Promise<RenderingTestContext>
>();
expectTypeOf(getApplication).toEqualTypeOf<() => Application | undefined>();
expectTypeOf(setApplication).toEqualTypeOf<
  (application: Application) => void
>();
expectTypeOf(setupApplicationContext).toEqualTypeOf<
  (context: TestContext) => Promise<void>
>();
expectTypeOf(validateErrorHandler).toMatchTypeOf<
  (
    callback?: (error: Error) => void
  ) =>
    | Readonly<{ isValid: true; message: null }>
    | Readonly<{ isValid: false; message: string }>
>();
expectTypeOf(setupOnerror).toEqualTypeOf<
  (onError?: (error: Error) => void) => void
>();
expectTypeOf(resetOnerror).toEqualTypeOf<() => void>();
expectTypeOf(getTestMetadata).toEqualTypeOf<
  (context: BaseContext) => TestMetadata
>();

// deprecation and warning APIs
expectTypeOf(getDeprecations).toEqualTypeOf<() => Array<DeprecationFailure>>();
expectTypeOf(getDeprecationsDuringCallback).toEqualTypeOf<
  (
    callback: () => void
  ) => Array<DeprecationFailure> | Promise<Array<DeprecationFailure>>
>();
expectTypeOf(getWarnings).toEqualTypeOf<() => Array<Warning>>();
expectTypeOf(getWarningsDuringCallback).toEqualTypeOf<
  (callback: () => void) => Array<Warning> | Promise<Array<Warning>>
>();

// Helper hooks
expectTypeOf(registerHook).toEqualTypeOf<
  (helperName: string, label: HookLabel, hook: Hook) => HookUnregister
>();
expectTypeOf(runHooks).toEqualTypeOf<
  (helperName: string, label: HookLabel, ...args: unknown[]) => Promise<void>
>();
