import { module, test } from 'qunit';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import {
  render,
  find,
  click,
  fillIn,
  tap,
  typeIn,
  settled,
  setupContext,
  setupRenderingContext,
  teardownContext,
  _registerHook,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

//
// Helpers
//

/** Register and return mock `fireEvent` hooks */
const setupMockHooks = (assert, eventTypes) => {
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

/** Unregister mock hooks */
const unregisterMockHooks = (mockHooks) => {
  mockHooks.forEach((mockHook) => mockHook.unregister());
};

/**
 * Build list of expected `fireEvent` steps for verification
 *
 * @param {string[]} eventTypes List of eventTypes
 * @return {string[]} List of expected `fireEvent` steps
 */
const buildExpectedSteps = (eventTypes) =>
  eventTypes.flatMap((eventType) => [
    'fireEvent:start',
    `fireEvent:${eventType}:start`,
    `fireEvent:end`,
    `fireEvent:${eventType}:end`,
  ]);

//
// Tests
//

module('DOM Helper: fireEvent', function (hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  hooks.beforeEach(async function () {
    await setupContext(this);
    await setupRenderingContext(this);
  });

  hooks.afterEach(async function () {
    await settled();
    await teardownContext(this);
  });

  test(`it executes registered fireEvent hooks for "click" helper`, async function (assert) {
    await render(hbs`<button type="button">Click me</button>`);

    const eventTypes = ['mousedown', 'mouseup', 'click'];
    const mockHooks = setupMockHooks(assert, eventTypes);

    try {
      const element = find('button');
      await click(element);

      const expectedSteps = buildExpectedSteps(eventTypes);
      assert.verifySteps(expectedSteps);
    } finally {
      unregisterMockHooks(mockHooks);
    }
  });

  test(`it executes registered fireEvent hooks for "tap" helper`, async function (assert) {
    await render(hbs`<button type="button">Click me</button>`);

    const eventTypes = [
      'touchstart',
      'touchend',
      'mousedown',
      'mouseup',
      'click',
    ];
    const mockHooks = setupMockHooks(assert, eventTypes);

    try {
      const element = find('button');
      await tap(element);

      const expectedSteps = buildExpectedSteps(eventTypes);
      assert.verifySteps(expectedSteps);
    } finally {
      unregisterMockHooks(mockHooks);
    }
  });

  test(`it executes registered fireEvent hooks for "fillIn" helper`, async function (assert) {
    await render(hbs`<input type="text" />`);

    const eventTypes = ['input', 'change'];
    const mockHooks = setupMockHooks(assert, eventTypes);

    try {
      const element = find('input');
      await fillIn(element, 'foo');

      const expectedSteps = buildExpectedSteps(eventTypes);
      assert.verifySteps(expectedSteps);
    } finally {
      unregisterMockHooks(mockHooks);
    }
  });

  test(`it executes registered fireEvent hooks for "typeIn" helper`, async function (assert) {
    await render(hbs`<input type="text" />`);

    const eventTypes = ['keydown', 'keypress', 'input', 'keyup', 'change'];
    const mockHooks = setupMockHooks(assert, eventTypes);

    try {
      const element = find('input');
      await typeIn(element, 'a');

      const expectedSteps = buildExpectedSteps(eventTypes);
      assert.verifySteps(expectedSteps);
    } finally {
      unregisterMockHooks(mockHooks);
    }
  });
});
