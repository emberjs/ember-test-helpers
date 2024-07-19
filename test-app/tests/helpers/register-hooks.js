import { registerHook } from '@ember/test-helpers';

/**
 * Register mock hooks for a helper and optional list of expected events performed while the helper is executed.
 *
 * @param {Assert} assert Test assertion context
 * @param {string} helperName Helper name
 * @param {Object} [options] Options object
 * @param {string[]} [options.expectedEvents] Expected events to register as `fireEvent` hooks. (NOTE: These are deduplicated to prevent registering duplicate step assertions.)
 * @returns {HookUnregister[]} Unregisterable hooks
 */
export const registerHooks = (assert, helperName, { expectedEvents } = {}) => {
  const mockHooks = [
    registerHook(helperName, 'start', () => {
      assert.step(`${helperName}:start`);
    }),
    registerHook(helperName, 'end', () => {
      assert.step(`${helperName}:end`);
    }),
  ];

  if (Array.isArray(expectedEvents)) {
    const fireEventHooks = registerFireEventHooks(assert, expectedEvents);
    mockHooks.push(...fireEventHooks);
  }

  return mockHooks;
};

/**
 * Register mock `fireEvent` hooks for provided event types.
 *
 * @param {Assert} assert Test assertion context
 * @param {string[]} [options.expectedEvents] Expected events to register as `fireEvent` hooks (NOTE: These are deduplicated to prevent registering duplicate step assertions.)
 * @returns {HookUnregister[]} Unregisterable hooks
 */
export const registerFireEventHooks = (assert, expectedEvents) => {
  const startHook = registerHook('fireEvent', 'start', () => {
    assert.step(`fireEvent:start`);
  });
  const endHook = registerHook('fireEvent', 'end', () => {
    assert.step(`fireEvent:end`);
  });

  const eventTypes = [...new Set(expectedEvents)];
  const eventSpecificHooks = eventTypes.flatMap((eventType) => [
    registerHook(`fireEvent:${eventType}`, 'start', () => {
      assert.step(`fireEvent:${eventType}:start`);
    }),
    registerHook(`fireEvent:${eventType}`, 'end', () => {
      assert.step(`fireEvent:${eventType}:end`);
    }),
  ]);

  return [startHook, endHook, ...eventSpecificHooks];
};

/**
 * Unregister list of provided mock hooks
 *
 * @param {HookUnregister[]} hooks Unregister hook objects
 */
export const unregisterHooks = (hooks) => {
  hooks.forEach((hook) => hook.unregister());
};

/**
 * Build expected `fireEvent` steps for verification.
 *
 * @param {string[]} expectedEvents Events expected to be executed
 * @return {string[]} Expected executed `fireEvent` steps
 */
export const buildExpectedFireEventSteps = (expectedEvents) =>
  expectedEvents?.flatMap((event) => [
    'fireEvent:start',
    `fireEvent:${event}:start`,
    `fireEvent:${event}:end`,
    `fireEvent:end`,
  ]);

/**
 * Build list of expected executed steps for verification.
 *
 * @param {string} helperName Helper name
 * @param {Object} [options] Options object
 * @param {string[]} [options.expectedEvents] Events expected to be executed
 * @return {string[]} Expected executed steps
 */
export const buildExpectedSteps = (helperName, { expectedEvents } = {}) =>
  [
    `${helperName}:start`,
    ...buildExpectedFireEventSteps(expectedEvents),
    `${helperName}:end`,
  ].filter(Boolean);

export default {
  registerHooks,
  registerFireEventHooks,
  buildExpectedSteps,
  buildExpectedFireEventSteps,
  unregisterHooks,
};
