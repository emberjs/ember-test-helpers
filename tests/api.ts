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
} from '@ember/test-helpers';
import { ComponentInstance } from '@glimmer/interfaces';
import { Owner } from '@ember/test-helpers/build-owner';
import { DebugInfo as BackburnerDebugInfo } from '@ember/runloop/-private/backburner';
import EmberResolver from 'ember-resolver';
import Application from '@ember/application';
import { TemplateFactory } from 'ember-cli-htmlbars';

type Target = string | Element | Document | Window;

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
expectTypeOf(tap).toEqualTypeOf<
  (target: Target, options?: TouchEventInit) => Promise<void>
>();
expectTypeOf(triggerEvent).toEqualTypeOf<
  (target: Target, eventType: string, options?: object) => Promise<void>
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
expectTypeOf(find).toEqualTypeOf<(selector: string) => Element | null>();
expectTypeOf(findAll).toEqualTypeOf<(selector: string) => Array<Element>>();
expectTypeOf(getRootElement).toEqualTypeOf<() => Element | Document>();

// Routing Helpers
expectTypeOf(visit).toEqualTypeOf<
  (url: string, options?: Record<string, unknown>) => Promise<void>
>();
expectTypeOf(currentRouteName).toEqualTypeOf<() => string>();
expectTypeOf(currentURL).toEqualTypeOf<() => string>();

// Rendering Helpers
expectTypeOf(render).toMatchTypeOf<
  (
    templateOrComponent: TemplateFactory | ComponentInstance,
    options?: { owner?: Owner }
  ) => Promise<void>
>();
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
    debugInfo?: InternalDebugInfo;
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
  (context: TestContext) => Promise<void>
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
