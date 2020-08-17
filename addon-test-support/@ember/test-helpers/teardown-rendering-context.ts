import { RenderingTestContext } from './setup-rendering-context';
import { nextTickPromise } from './-utils';
import settled from './settled';

/**
  Used by test framework addons to tear down the provided context after testing is completed.

  Responsible for:

  - resetting the `ember-testing-container` to its original state (the value
    when `setupRenderingContext` was called).

  @public
  @param {Object} context the context to setup
  @param {Object} [options] options used to override defaults
  @param {boolean} [options.waitForSettled=true] should the teardown wait for `settled()`ness
  @returns {Promise<void>} resolves when settled
*/
export default function teardownRenderingContext(
  context: RenderingTestContext,
  options?: { waitForSettled?: boolean }
): Promise<void> {
  let waitForSettled = true;
  if (options !== undefined && 'waitForSettled' in options) {
    waitForSettled = options.waitForSettled!;
  }

  return nextTickPromise().then(() => {
    if (waitForSettled) {
      return settled();
    }

    return nextTickPromise();
  });
}
