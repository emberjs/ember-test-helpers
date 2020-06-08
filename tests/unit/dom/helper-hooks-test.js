import { module, test } from 'qunit';
import { _registerHook, _runHooks } from '@ember/test-helpers';

module('helper hooks', function () {
  test('it can register a hook for a helper', async function (assert) {
    let func = () => assert.step('click:start hook');
    let hook = _registerHook('click', 'start', func);

    // it runs the hook
    await _runHooks('click', 'start');
    assert.verifySteps(['click:start hook']);

    // can run multiple times
    await _runHooks('click', 'start');
    assert.verifySteps(['click:start hook']);

    // unregister works
    hook.unregister();
  });

  test('it can register an unregister a hook for a helper', async function (assert) {
    let func = () => assert.step('click:start hook');
    let hook = _registerHook('click', 'start', func);

    // it runs the hook
    await _runHooks('click', 'start');
    assert.verifySteps(['click:start hook']);

    // can run multiple times
    await _runHooks('click', 'start');
    assert.verifySteps(['click:start hook']);

    // unregister works
    hook.unregister();
    await _runHooks('click', 'start');
    assert.verifySteps([]);
  });

  test('it can run hooks for a helper by label', async function (assert) {
    let fooHook1 = _registerHook('click', 'foo', () => {
      assert.step('click:foo1');
    });
    let fooHook2 = _registerHook('click', 'foo', () => {
      assert.step('click:foo2');
    });

    await _runHooks('click', 'foo');

    assert.verifySteps(['click:foo1', 'click:foo2']);

    fooHook1.unregister();
    fooHook2.unregister();
  });
});
