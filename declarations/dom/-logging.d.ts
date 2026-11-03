import type { Target } from './-target';
/**
 * Logs a debug message to the console if the `testHelperLogging` query
 * parameter is set.
 *
 * @private
 * @param {string} helperName Name of the helper
 * @param {string|Element} target The target element or selector
 */
export declare function log(helperName: string, target: Target, ...args: any[]): void;
/**
 * This generates a human-readable description to a DOM element.
 *
 * @private
 * @param {*} el The element that should be described
 * @returns {string} A human-readable description
 */
export declare function elementToString(el: unknown): string;
//# sourceMappingURL=-logging.d.ts.map