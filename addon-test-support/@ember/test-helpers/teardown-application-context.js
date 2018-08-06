import settled from './settled';
import { guidFor } from '@ember/object/internals';
import { APPLICATION_CLEANUP } from './setup-application-context';
import { nextTickPromise, runDestroyablesFor } from './-utils';

/**
  Used by test framework addons to tear down the provided context after testing is completed.

  @public
  @param {Object} context the context to setup
  @returns {Promise<void>} resolves when settled
*/
export default function(context) {
  return nextTickPromise().then(() => {
    let contextGuid = guidFor(context);

    runDestroyablesFor(APPLICATION_CLEANUP, contextGuid);

    return settled();
  });
}
