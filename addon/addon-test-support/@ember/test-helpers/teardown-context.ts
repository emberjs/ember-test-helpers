import { TestContext } from './setup-context';
import settled from './settled';
import { _cleanupOnerror } from './setup-onerror';
import { destroy } from '@ember/destroyable';

export interface TeardownContextOptions {
  waitForSettled?: boolean | undefined;
}

/**
  Used by test framework addons to tear down the provided context after testing is completed.

  Responsible for:

  - un-setting the "global testing context" (`unsetContext`)
  - destroy the contexts owner object
  - remove AJAX listeners

  @public
  @param {Object} context the context to setup
  @param {Object} [options] options used to override defaults
  @param {boolean} [options.waitForSettled=true] should the teardown wait for `settled()`ness
  @returns {Promise<void>} resolves when settled
*/
export default function teardownContext(
  context: TestContext,
  { waitForSettled = true }: TeardownContextOptions = {}
): Promise<void> {
  return Promise.resolve()
    .then(() => {
      _cleanupOnerror(context);

      destroy(context);
    })
    .finally(() => {
      if (waitForSettled) {
        return settled();
      }

      return;
    });
}
