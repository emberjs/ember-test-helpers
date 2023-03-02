export type Hook = (...args: any[]) => void | Promise<void>;
export type HookHelperName =
  | 'blur'
  | 'click'
  | 'doubleClick'
  | 'fillIn'
  | 'fireEvent'
  | 'focus'
  | 'render'
  | 'scrollTo'
  | 'select'
  | 'tab'
  | 'tap'
  | 'triggerEvent'
  | 'triggerKeyEvent'
  | 'typeIn'
  | 'visit'
  | string;
export type HookLabel = 'start' | 'end' | string;
export type HookUnregister = {
  unregister: () => void;
};

const registeredHooks = new Map<string, Set<Hook>>();

/**
 * @private
 * @param {string} helperName The name of the test helper in which to run the hook.
 * @param {string} label A label to help identify the hook.
 * @returns {string} The compound key for the helper.
 */
function getHelperKey(helperName: HookHelperName, label: string): string {
  return `${helperName}:${label}`;
}

/**
 * Registers a hook function to be run during the invocation of a test helper.
 *
 * @private
 * @param {string} helperName The name of the test helper in which to run the hook.
 * @param {string} label A label to help identify the hook. Built-in labels are `start` and `end`,
 *                       designating either the start or the end of the helper invocation.
 * @param {Function} hook The hook function to run when the test helper is invoked.
 * @returns {HookUnregister} An object containing an `unregister` function that unregisters
 *                           the specific hook initially registered to the helper.
 */
export function registerHook(
  helperName: HookHelperName,
  label: HookLabel,
  hook: Hook
): HookUnregister {
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
 * @param {string} helperName  The name of the test helper.
 * @param {string} label A label to help identify the hook. Built-in labels are `start` and `end`,
 *                       designating the start of the helper invocation and the end.
 * @param {unknown[]} args Any arguments originally passed to the test helper.
 * @returns {Promise<void>} A promise representing the serial invocation of the hooks.
 */
export function runHooks(
  helperName: HookHelperName,
  label: HookLabel,
  ...args: unknown[]
): Promise<void> {
  let hooks =
    registeredHooks.get(getHelperKey(helperName, label)) || new Set<Hook>();
  let promises: Array<void | Promise<void>> = [];

  hooks.forEach((hook) => {
    let hookResult = hook(...args);

    promises.push(hookResult);
  });

  return Promise.all(promises).then(() => {});
}
