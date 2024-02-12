import { BaseContext } from './setup-context';

class TestMetadata {
  [key: string]: any;
  testName?: string;
  setupTypes: string[];
  usedHelpers: string[];

  constructor() {
    this.setupTypes = [];
    this.usedHelpers = [];
  }

  get isRendering() {
    return (
      this.setupTypes.indexOf('setupRenderingContext') > -1 &&
      this.usedHelpers.indexOf('render') > -1
    );
  }

  get isApplication() {
    return this.setupTypes.indexOf('setupApplicationContext') > -1;
  }
}

export {
  // Exported only for testing purposes.
  TestMetadata as __TestMetadata,
};

// Only export the type side of the item: this way the only way (it is legal) to
// construct it is here, but users can still reference the type.
export type {
  /**
   * A non-user-constructible interface representing the metadata associated
   * with a test, designed for test frameworks to use e.g. with their reporters.
   */
  TestMetadata,
};

const TEST_METADATA = new WeakMap<BaseContext, TestMetadata>();

/**
 * Gets the test metadata associated with the provided test context. Will create
 * a new test metadata object if one does not exist.
 *
 * @param {BaseContext} context the context to use
 * @returns {TestMetadata} the test metadata for the provided context
 */
export default function getTestMetadata(context: BaseContext): TestMetadata {
  if (!TEST_METADATA.has(context)) {
    TEST_METADATA.set(context, new TestMetadata());
  }

  return TEST_METADATA.get(context)!;
}
