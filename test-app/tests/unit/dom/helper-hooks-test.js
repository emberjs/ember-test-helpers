import { module, test } from 'qunit';
import { Promise } from 'rsvp';
import { registerHook, runHooks, isSettled } from '@ember/test-helpers';

module('helper hooks', function () {
  test('it can register a hook for a helper', async function (assert) {
    let func = () => assert.step('click:start hook');
    let hook = registerHook('click', 'start', func);

    try {
      await runHooks('click', 'start');
      assert.verifySteps(['click:start hook']);

      await runHooks('click', 'start');
      assert.verifySteps(['click:start hook']);
    } finally {
      hook.unregister();
    }
  });

  test('it can register an unregister a hook for a helper', async function (assert) {
    let func = () => assert.step('click:start hook');
    let hook = registerHook('click', 'start', func);

    try {
      await runHooks('click', 'start');
      assert.verifySteps(['click:start hook']);

      await runHooks('click', 'start');
      assert.verifySteps(['click:start hook']);

      hook.unregister();
      await runHooks('click', 'start');
      assert.verifySteps([]);
    } finally {
      hook.unregister();
    }
  });

  test('it can register a hook that returns a promise / has a delay', async function (assert) {
    let func = () => {
      assert.step('starting hook');

      return new Promise((resolve) => {
        setTimeout(() => {
          assert.step('resolving hook promise');
          resolve();
        }, 100);
      });
    };
    let hook = registerHook('click', 'start', func);

    try {
      assert.step('running hooks for click:start');
      await runHooks('click', 'start');
      assert.step('hooks finished for click:start');

      assert.verifySteps([
        'running hooks for click:start',
        'starting hook',
        'resolving hook promise',
        'hooks finished for click:start',
      ]);
    } finally {
      hook.unregister();
    }
  });

  test('it can run hooks for a helper by label', async function (assert) {
    let fooHook1 = registerHook('click', 'foo', () => {
      assert.step('click:foo1');
    });
    let fooHook2 = registerHook('click', 'foo', () => {
      assert.step('click:foo2');
    });

    try {
      await runHooks('click', 'foo');

      assert.verifySteps(['click:foo1', 'click:foo2']);
    } finally {
      fooHook1.unregister();
      fooHook2.unregister();
    }
  });

  test('it is settled after runHooks resolves', async function (assert) {
    await runHooks('missing-thing', 'start');

    assert.ok(isSettled(), 'is settled after runHooks with no hooks');

    let func = () => {};
    let hook = registerHook('present-thing', 'start', func);

    try {
      await runHooks('click', 'start');

      assert.ok(isSettled(), 'is settled after runHooks when a hook exists');
    } finally {
      hook.unregister();
    }
  });
});
