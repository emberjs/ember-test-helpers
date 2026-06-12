import type { BaseContext } from './setup-context';
declare class TestMetadata {
    [key: string]: any;
    testName?: string;
    setupTypes: string[];
    usedHelpers: string[];
    constructor();
    get isRendering(): boolean;
    get isApplication(): boolean;
}
export { TestMetadata as __TestMetadata, };
export type { 
/**
 * A non-user-constructible interface representing the metadata associated
 * with a test, designed for test frameworks to use e.g. with their reporters.
 */
TestMetadata, };
/**
 * Gets the test metadata associated with the provided test context. Will create
 * a new test metadata object if one does not exist.
 *
 * @param {BaseContext} context the context to use
 * @returns {TestMetadata} the test metadata for the provided context
 */
export default function getTestMetadata(context: BaseContext): TestMetadata;
//# sourceMappingURL=test-metadata.d.ts.map