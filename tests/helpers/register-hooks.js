import { _registerHook } from '@ember/test-helpers';

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
    _registerHook(helperName, 'start', () => {
      assert.step(`${helperName}:start`);
    }),
    _registerHook(helperName, 'end', () => {
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
  const startHook = _registerHook('fireEvent', 'start', () => {
    assert.step(`fireEvent:start`);
  });
  const endHook = _registerHook('fireEvent', 'end', () => {
    assert.step(`fireEvent:end`);
  });

  const eventSpecificHooks = [...new Set(expectedEvents)].flatMap(
    (eventType) => [
      _registerHook(`fireEvent:${eventType}`, 'start', () => {
        assert.step(`fireEvent:${eventType}:start`);
      }),
      _registerHook(`fireEvent:${eventType}`, 'end', () => {
        assert.step(`fireEvent:${eventType}:end`);
      }),
    ]
  );

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
// TODO: rename `eventTypes` to `expectedEvents`
export const buildExpectedFireEventSteps = (expectedEvents) =>
  expectedEvents?.flatMap((event) => [
    'fireEvent:start',
    `fireEvent:${event}:start`,
    `fireEvent:end`,
    `fireEvent:${event}:end`,
  ]);

/**
 * Build list of expected executed steps for verification.
 *
 * @param {string} helperName Helper name
 * @param {Object} [options] Options object
 * @param {string[]} [options.expectedEvents] Events expected to be executed
 * @return {string[]} Expected executed steps
 */
// TODO: rename `eventTypes` to `expectedEvents`
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
