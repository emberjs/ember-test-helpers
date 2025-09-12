import type { TestContext } from './setup-context';
import { setTesting } from '@ember/debug';
import { unsetContext } from './setup-context.ts';
import settled from './settled.ts';
import { _cleanupOnerror } from './setup-onerror.ts';
import { destroy } from '@ember/destroyable';

export interface TeardownContextOptions {
  waitForSettled?: boolean | undefined;
}

/**
  Used by test framework addons to tear down the provided context after testing is completed.

  Responsible for:

  - un-setting the "global testing context" (`unsetContext`)
  - destroy the contexts owner object

  @public
  @param {Object} context the context to setup
  @param {Object} [options] options used to override defaults
  @param {boolean} [options.waitForSettled=true] should the teardown wait for `settled()`ness
  @returns {Promise<void>} resolves when settled
*/
export default function teardownContext(
  context: TestContext,
  { waitForSettled = true }: TeardownContextOptions = {},
): Promise<void> {
  return Promise.resolve()
    .then(() => {
      _cleanupOnerror(context);

      setTesting(false);
      unsetContext();
      destroy(context.owner);
    })
    .finally(() => {
      if (waitForSettled) {
        return settled();
      }

      return;
    });
}
