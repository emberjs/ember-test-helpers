import { guidFor } from '@ember/object/internals';
import { RENDERING_CLEANUP } from './setup-rendering-context';
import { nextTickPromise, runDestroyablesFor } from './-utils';
import settled from './settled';

/**
  Used by test framework addons to tear down the provided context after testing is completed.

  Responsible for:

  - resetting the `ember-testing-container` to its original state (the value
    when `setupRenderingContext` was called).

  @public
  @param {Object} context the context to setup
  @returns {Promise<void>} resolves when settled
*/
export default function teardownRenderingContext(context) {
  return nextTickPromise().then(() => {
    let contextGuid = guidFor(context);

    runDestroyablesFor(RENDERING_CLEANUP, contextGuid);

    return settled();
  });
}
