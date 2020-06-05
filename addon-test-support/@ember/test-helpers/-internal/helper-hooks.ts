type Hook = (...args: any[]) => void | Promise<void>;
type HookUnregister = {
  unregister: () => void;
};

const registeredHooks = new Map<string, Set<Hook>>();

/**
 *
 * @param {string} helperName The name of the test helper in which to run the hook.
 * @param {string} order The order, either `start` or `end`, to run the hook.
 * @returns {string} The compound key for the helper.
 */
function getHelperKey(helperName: string, order: string) {
  return `${helperName}:${order}`;
}

/**
 * Registers a hook function to be run during the invocation of a test helper.
 *
 * @public
 * @param {string} helperName The name of the test helper in which to run the hook.
 * @param {string} order The order, either `start` or `end`, to run the hook.
 * @param {Function} hook The hook function to run when the test helper is invoked.
 * @returns {HookUnregister} An object containing an unregister function that will unregister
 *                           the specific hook registered to the helper.
 */
export function registerHook(helperName: string, order: string, hook: Hook): HookUnregister {
  let helperKey = getHelperKey(helperName, order);
  let hooksForHelper = registeredHooks.get(helperKey);

  if (hooksForHelper === undefined) {
    hooksForHelper = new Set<Hook>();
    registeredHooks.set(helperKey, hooksForHelper);
  }

  hooksForHelper.add(hook);

  return {
    unregister() {
      hooksForHelper!.delete(hook);
    },
  };
}

/**
 * Runs all hooks registered for a specific test helper.
 *
 * @public
 * @param {string} helperName  The name of the test helper.
 * @param {string} order The order, either `start` or `end`, to run the hook.
 * @param {any[]} args Any arguments originally passed to the test helper.
 * @returns {Promise<void>} A promise representing the serial invocation of the hooks.
 */
export function runHooks(helperName: string, order: string, ...args: any[]): Promise<void> {
  let hooks = registeredHooks.get(getHelperKey(helperName, order)) || new Set<Hook>();
  let promise = Promise.resolve();

  hooks.forEach(hook => promise.then(() => hook(...args)));

  return promise;
}
