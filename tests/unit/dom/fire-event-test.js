import { module, test } from 'qunit';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import {
  render,
  find,
  click,
  tap,
  focus,
  settled,
  setupContext,
  setupRenderingContext,
  teardownContext,
  _registerHook,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

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

  const SIMPLE_ACTION_HELPER_FUNCS = [click, tap, focus];

  SIMPLE_ACTION_HELPER_FUNCS.forEach((helperFn) => {
    test(`it executes registered fireEvent hooks for "${helperFn.name}" helper`, async function (assert) {
      await render(hbs`<input type="text" />`);

      const element = find('input');

      const startHook = _registerHook(
        `fireEvent:${helperFn.name}`,
        'start',
        () => {
          assert.step(`fireEvent:${helperFn.name}:start`);
        }
      );
      const endHook = _registerHook(`fireEvent:${helperFn.name}`, 'end', () => {
        assert.step(`fireEvent:${helperFn.name}:end`);
      });

      try {
        await helperFn(element);

        assert.verifySteps([
          `fireEvent:${helperFn.name}:start`,
          `fireEvent:${helperFn.name}:end`,
        ]);
      } finally {
        startHook.unregister();
        endHook.unregister();
      }
    });
  });
});
