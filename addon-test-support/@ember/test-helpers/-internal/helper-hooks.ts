type Hook = (...args: any[]) => void | Promise<void>;
type HookUnregister = {
  unregister: () => void;
};

const registeredHooks = new Map<string, Set<Hook>>();

/**
 * Registers a hook function to be run during the invocation of a test helper.
 *
 * @public
 * @param {string} helperName The name of the test helper in which to run the hook.
 * @param {Function} hook The hook function to run when the test helper is invoked.
 * @returns {HookUnregister} An object containing an unregister function that will unregister
 *                           the specific hook registered to the helper.
 */
export function registerHook(helperName: string, hook: Hook): HookUnregister {
  let hooksForHelper = registeredHooks.get(helperName);

  if (hooksForHelper === undefined) {
    hooksForHelper = new Set<Hook>();
    registeredHooks.set(helperName, hooksForHelper);
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
 * @param {any[]} args Any arguments originally passed to the test helper.
 * @returns {Promise<void>} A promise representing the serial invocation of the hooks.
 */
export function runHooks(helperName: string, ...args: any[]): Promise<void> {
  let hooks = registeredHooks.get(helperName) || new Set<Hook>();
  let promise = Promise.resolve();

  hooks.forEach(hook => promise.then(() => hook(...args)));

  return promise;
}
