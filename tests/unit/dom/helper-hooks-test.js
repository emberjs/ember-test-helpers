import { module, test } from 'qunit';
import { registerHook } from '@ember/test-helpers';
import { registeredHooks, runHooks } from '@ember/test-helpers/-internal/helper-hooks';

module('helper hooks', function () {
  test('it can register a hook for a helper', function (assert) {
    let func = () => {};
    let hook = registerHook('click', 'start', func);

    let registeredHook = registeredHooks.get('click:start');

    assert.ok(registeredHooks.has('click:start'));
    assert.equal(registeredHook.size, 2);
    assert.ok(registeredHook.has(func));

    hook.unregister();
  });

  test('it can register an unregister a hook for a helper', function (assert) {
    let func = () => {};
    let hook = registerHook('click', 'start', func);

    let registeredHook = registeredHooks.get('click:start');

    assert.ok(registeredHooks.has('click:start'));
    assert.equal(registeredHook.size, 2);
    assert.ok(registeredHook.has(func));

    hook.unregister();

    assert.notOk(registeredHook.has(func));
  });

  test('it can run hooks for a helper by label', async function (assert) {
    registerHook('click', 'foo', () => {
      assert.step('click:foo1');
    });
    registerHook('click', 'foo', () => {
      assert.step('click:foo2');
    });

    await runHooks('click', 'foo');

    assert.verifySteps(['click:foo1', 'click:foo2']);

    registeredHooks.delete('click:foo');
  });
});
