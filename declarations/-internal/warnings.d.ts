import type { BaseContext } from '../setup-context';
export interface WarningOptions {
    id?: string;
}
export interface Warning {
    message: string;
    options?: WarningOptions;
}
/**
 *
 * Provides the list of warnings associated with a given base context;
 *
 * @private
 * @param {BaseContext} [context] the test context
 * @return {Array<Warning>} the warnings associated with the corresponding BaseContext;
 */
export declare function getWarningsForContext(context: BaseContext): Array<Warning>;
/**
 *
 * Provides the list of warnings associated with a given test context which
 * occurred only while a the provided callback is executed. This callback can be
 * synchronous, or it can be an async function.
 *
 * @private
 * @param {BaseContext} [context] the test context
 * @param {Function} [callback] The callback that when executed will have its warnings recorded
 * @return {Array<Warning>} The warnings associated with the corresponding baseContext which occurred while the CallbackFunction was executed
 */
export declare function getWarningsDuringCallbackForContext(context: BaseContext, callback: () => void): Array<Warning> | Promise<Array<Warning>>;
//# sourceMappingURL=warnings.d.ts.map