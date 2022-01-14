import { _registerHook } from '@ember/test-helpers';

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

  const eventSpecificHooks = eventTypes.flatMap((eventType) => [
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
 * @param {string[]} eventTypes List of eventTypes
 * @return {string[]} List of expected `fireEvent` steps
 */
export const buildFireEventSteps = (eventTypes) =>
  eventTypes.flatMap((eventType) => [
    'fireEvent:start',
    `fireEvent:${eventType}:start`,
    `fireEvent:end`,
    `fireEvent:${eventType}:end`,
  ]);

export default {
  registerFireEventHooks,
  buildFireEventSteps,
  unregisterHooks,
};
