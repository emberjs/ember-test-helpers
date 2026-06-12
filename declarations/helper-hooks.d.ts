export type Hook = (...args: any[]) => void | Promise<void>;
export type HookLabel = 'start' | 'end' | 'targetFound';
export type HookUnregister = {
    unregister: () => void;
};
/**
 * Registers a function to be run during the invocation of a test helper.
 *
 * @param {string} helperName The name of the test helper in which to run the hook.
 *                            Test helper names include `blur`, `click`, `doubleClick`, `fillIn`,
 *                            `fireEvent`, `focus`, `render`, `scrollTo`, `select`, `tab`, `tap`, `triggerEvent`,
 *                            `triggerKeyEvent`, `typeIn`, and `visit`.
 * @param {string} label A label to help identify the hook. Built-in labels include `start`, `end`,
 *                       and `targetFound`, the former designating either the start or end of
 *                       the helper invocation.
 * @param {Function} hook The hook function to run when the test helper is invoked.
 * @returns {HookUnregister} An object containing an `unregister` function that unregisters
 *                           the specific hook initially registered to the helper.
 * @example
 * <caption>
 *   Registering a hook for the `end` point of the `click` test helper invocation
 * </caption>
 *
 * const hook = registerHook('click', 'end', () => {
 *   console.log('Running `click:end` test helper hook');
 * });
 *
 * // Unregister the hook at some later point in time
 * hook.unregister();
 */
export declare function registerHook(helperName: string, label: HookLabel, hook: Hook): HookUnregister;
/**
 * Runs all hooks registered for a specific test helper.
 *
 * @param {string} helperName The name of the test helper in which to run the hook.
 *                            Test helper names include `blur`, `click`, `doubleClick`, `fillIn`,
 *                            `fireEvent`, `focus`, `render`, `scrollTo`, `select`, `tab`, `tap`, `triggerEvent`,
 *                            `triggerKeyEvent`, `typeIn`, and `visit`.
 * @param {string} label A label to help identify the hook. Built-in labels include `start`, `end`,
 *                       and `targetFound`, the former designating either the start or end of
 *                       the helper invocation.
 * @param {unknown[]} args Any arguments originally passed to the test helper.
 * @returns {Promise<void>} A promise representing the serial invocation of the hooks.
 */
export declare function runHooks(helperName: string, label: HookLabel, ...args: unknown[]): Promise<void>;
//# sourceMappingURL=helper-hooks.d.ts.map