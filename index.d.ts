// DOM Interaction Helpers

export type Target = string | Element;

export type KeyEvent = 'keydown' | 'keyup' | 'keypress';

export interface KeyModifiers {
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
}

export function click(target: Target): Promise<void>;
export function tap(target: Target): Promise<void>;
export function focus(target: Target): Promise<void>;
export function blur(target: Target): Promise<void>;
export function triggerEvent(target: Target, eventType: string, options?: object): Promise<void>;
export function triggerKeyEvent(target: Target, eventType: KeyEvent, modifiers?: KeyModifiers): Promise<void>;
export function fillIn(target: Target, text: string): Promise<void>;

// DOM Query Helpers

export function find(selector: string): Element | null;
export function findAll(selector: string): Array<Element>;
export function getRootElement(): Element;

// Routing Helpers

export function visit(url: string): Promise<void>;
export function currentRouteName(): string;
export function currentURL(): string;

// Rendering Helpers

import { TemplateFactory } from 'htmlbars-inline-precompile';

export function render(template: TemplateFactory): Promise<void>;
export function clearRender(): Promise<void>;

// Wait Helpers

export interface WaitForOptions {
  timeout?: number;
  count?: number;
  timeoutMessage?: string;
}

export interface SettledState {
  hasRunLoop: boolean;
  hasPendingTimers: boolean;
  hasPendingWaiters: boolean;
  hasPendingRequests: boolean;
  pendingRequestCount: number;
}

export function waitFor(selector: string, options?: WaitForOptions): Element | Array<Element>;
export function waitUntil<T>(callback: () => T, options?: WaitUntilOptions): Promise<T>;
export function settled(): Promise<void>;
export function isSettled(): boolean;
export function getSettledState(): SettledState;

// Pause Helpers

export function pauseTest(): Promise<void>;
export function resumeTest(): void;

// Test Framework APIs

import Application from '@ember/application';
import Resolver from '@ember/application/resolver';
import Error from '@ember/error';

export function setResolver(resolver: Resolver): void;
export function getResolver(): Resolver;
export function setupContext<C extends object>(context: C, options?: { resolver?: Resolver }): Promise<C>;
export function getContext(): object;
export function setContext(context: object): void;
export function unsetContext(): void;
export function teardownContext(context: object): Promise<void>;
export function setupRenderingContext<C extends object>(context: C): Promise<C>;
export function teardownRenderingContext(context: object): Promise<void>;
export function getApplication(): Application;
export function setApplication(aplication: Application): void;
export function setupApplicationContext<C extends object>(context: C): Promise<C>;
export function teardownApplicationContext(context: object): Promise<void>;
export function validateErrorHandler(callback?: (error: Error) => void): { isValid: boolean, message: string };
