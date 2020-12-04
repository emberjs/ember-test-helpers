import { Promise } from '../-utils';

type Hook = (...args: any[]) => void | Promise<void>;
type HookLabel = 'start' | 'end' | string;
type HookUnregister = {
  unregister: () => void;
};

const registeredHooks = new Map<string, Set<Hook>>();

/**
 * @private
 * @param {string} helperName The name of the test helper in which to run the hook.
 * @param {string} label A label to help identify the hook.
 * @returns {string} The compound key for the helper.
 */
function getHelperKey(helperName: string, label: string) {
  return `${helperName}:${label}`;
}

/**
 * Registers a hook function to be run during the invocation of a test helper.
 *
 * @private
 * @param {string} helperName The name of the test helper in which to run the hook.
 * @param {string} label A label to help identify the hook. Built-in labels are `start` and `end`,
 *                       designating the start of the helper invocation and the end.
 * @param {Function} hook The hook function to run when the test helper is invoked.
 * @returns {HookUnregister} An object containing an unregister function that will unregister
 *                           the specific hook registered to the helper.
 */
export function registerHook(helperName: string, label: HookLabel, hook: Hook): HookUnregister {
  let helperKey = getHelperKey(helperName, label);
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
 * @private
 * @param {string} helperName  The name of the test helper.
 * @param {string} label A label to help identify the hook. Built-in labels are `start` and `end`,
 *                       designating the start of the helper invocation and the end.
 * @param {any[]} args Any arguments originally passed to the test helper.
 * @returns {Promise<void>} A promise representing the serial invocation of the hooks.
 */
export function runHooks(helperName: string, label: HookLabel, ...args: any[]): Promise<void> {
  let hooks = registeredHooks.get(getHelperKey(helperName, label)) || new Set<Hook>();
  let promises = [];

  hooks.forEach(hook => {
    let hookResult = hook(...args);

    promises.push(hookResult);
  });

  return Promise.all(promises).then(() => {});
}
