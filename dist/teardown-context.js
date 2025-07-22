import { setTesting } from '@ember/debug';
import { _ as _cleanupOnerror, q as _teardownAJAXHooks, u as unsetContext, s as settled } from './setup-context-BSrEM03X.js';
import { destroy } from '@ember/destroyable';

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
function teardownContext(context, {
  waitForSettled = true
} = {}) {
  return Promise.resolve().then(() => {
    _cleanupOnerror(context);
    _teardownAJAXHooks();
    setTesting(false);
    unsetContext();
    destroy(context.owner);
  }).finally(() => {
    if (waitForSettled) {
      return settled();
    }
    return;
  });
}

export { teardownContext as default };
//# sourceMappingURL=teardown-context.js.map
