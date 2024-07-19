const STACK = 'STACK';

export class MockConsole {
  constructor() {
    this._buffer = [];
  }

  group(str) {
    this._buffer.push(str);
  }

  log(str) {
    this._buffer.push(str);
  }

  groupEnd() {}

  toString() {
    return this._buffer.join('\n');
  }
}

export function getRandomBoolean() {
  return Math.random() >= 0.5;
}

export function getMockDebugInfo(autorun = null, timersCount = 0, queues) {
  let debugInfo = {};
  let queueItem = { stack: STACK };

  if (autorun) {
    debugInfo.autorun = autorun;
  }

  let timers = [];
  for (let i = 0; i < timersCount; i++) {
    timers.push(queueItem);
  }
  debugInfo.timers = timers;

  let instanceStack = {};
  debugInfo.instanceStack = [instanceStack];

  queues &&
    queues.forEach((queue) => {
      let queueValue = [];
      for (let i = 0; i < queue.count; i++) {
        queueValue.push(queueItem);
      }

      instanceStack[queue.name] = queueValue;
    });

  return debugInfo;
}

export function getMockSettledState(
  hasPendingTimers = false,
  hasRunLoop = false,
  hasPendingLegacyWaiters = false,
  hasPendingTestWaiters = false,
  hasPendingRequests = false,
  pendingRequestCount = 0
) {
  return {
    hasPendingTimers,
    hasRunLoop,
    hasPendingLegacyWaiters,
    hasPendingTestWaiters,
    hasPendingRequests,
    pendingRequestCount,
  };
}
