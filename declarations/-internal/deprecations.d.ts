import type { BaseContext } from '../setup-context';
export interface DeprecationOptions {
    id: string;
    until: string;
    for?: string;
    since?: {
        available: string;
    };
}
export interface DeprecationFailure {
    message: string;
    options?: DeprecationOptions;
}
/**
 *
 * Provides the list of deprecation failures associated with a given base context;
 *
 * @private
 * @param {BaseContext} [context] the test context
 * @return {Array<DeprecationFailure>} the Deprecation Failures associated with the corresponding BaseContext;
 */
export declare function getDeprecationsForContext(context: BaseContext): Array<DeprecationFailure>;
/**
 *
 * Provides the list of deprecation failures associated with a given base
 * context which occur while a callback is executed. This callback can be
 * synchronous, or it can be an async function.
 *
 * @private
 * @param {BaseContext} [context] the test context
 * @param {Function} [callback] The callback that when executed will have its DeprecationFailure recorded
 * @return {Array<DeprecationFailure>} The Deprecation Failures associated with the corresponding baseContext which occurred while the CallbackFunction was executed
 */
export declare function getDeprecationsDuringCallbackForContext(context: BaseContext, callback: () => void): Array<DeprecationFailure> | Promise<Array<DeprecationFailure>>;
//# sourceMappingURL=deprecations.d.ts.map