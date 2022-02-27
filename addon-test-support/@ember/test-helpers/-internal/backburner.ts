// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/32970

// @ts-expect-error Private API
import { _backburner, run } from '@ember/runloop';
import type * as _Backburner from '@ember/runloop/-private/backburner';

export type QueueItem = _Backburner.QueueItem;

export interface DebugInfo
  extends Omit<_Backburner.DebugInfo, 'instanceStack'> {
  instanceStack: DeferredActionQueues[];
}

export type DeferredActionQueues = {
  [K in string]: K extends keyof _Backburner.DeferredActionQueues
    ? unknown extends _Backburner.DeferredActionQueues[K]
      ? QueueItem[]
      : _Backburner.DeferredActionQueues[K]
    : never;
};

export interface Backburner extends _Backburner.Backburner {
  currentInstance: DeferredActionQueues | null;
  hasTimers(): boolean;
}

// @ts-expect-error Private API
export const backburner: Backburner = _backburner ?? run.backburner;
