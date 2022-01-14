import { _registerHook } from '@ember/test-helpers';

/**
 * Register mock hooks for a helper and optional list of expected events performed while the helper is executed.
 *
 * @param {Assert} assert Test assertion context
 * @param {string} helperName Helper name
 * @param {Object} [options] Options object
 * @param {string[]} [options.eventTypes] Event types to register
 * @returns {HookUnregister[]} Unregisterable hooks
 */
export const registerHooks = (assert, helperName, { eventTypes } = {}) => {
  const mockHooks = [
    _registerHook(helperName, 'start', () => {
      assert.step(`${helperName}:start`);
    }),
    _registerHook(helperName, 'end', () => {
      assert.step(`${helperName}:end`);
    }),
  ];

  if (Array.isArray(eventTypes)) {
    const fireEventHooks = registerFireEventHooks(assert, eventTypes);
    mockHooks.push(...fireEventHooks);
  }

  return mockHooks;
};

/**
 * Register mock `fireEvent` hooks for provided event types.
 *
 * @param {Assert} assert Test assertion context
 * @param {string[]} eventTypes Event types to register
 * @returns {HookUnregister[]} Unregisterable hooks
 */
export const registerFireEventHooks = (assert, eventTypes) => {
  const startHook = _registerHook('fireEvent', 'start', () => {
    assert.step(`fireEvent:start`);
  });
  const endHook = _registerHook('fireEvent', 'end', () => {
    assert.step(`fireEvent:end`);
  });

  const eventSpecificHooks = [...new Set(eventTypes)].flatMap((eventType) => [
    _registerHook(`fireEvent:${eventType}`, 'start', () => {
      assert.step(`fireEvent:${eventType}:start`);
    }),
    _registerHook(`fireEvent:${eventType}`, 'end', () => {
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
 * @param {string[]} eventTypes Event types
 * @return {string[]} Expected executed `fireEvent` steps
 */
export const buildExpectedFireEventSteps = (eventTypes) =>
  eventTypes?.flatMap((eventType) => [
    'fireEvent:start',
    `fireEvent:${eventType}:start`,
    `fireEvent:end`,
    `fireEvent:${eventType}:end`,
  ]);

/**
 * Build list of expected executed steps for verification.
 *
 * @param {string} helperName Helper name
 * @param {Object} [options] Options object
 * @param {string[]} [options.eventTypes] Event types to register
 * @return {string[]} Expected executed steps
 */
export const buildExpectedSteps = (helperName, { eventTypes } = {}) =>
  [
    `${helperName}:start`,
    ...buildExpectedFireEventSteps(eventTypes),
    `${helperName}:end`,
  ].filter(Boolean);

export default {
  registerHooks,
  registerFireEventHooks,
  buildExpectedSteps,
  buildExpectedFireEventSteps,
  unregisterHooks,
};
