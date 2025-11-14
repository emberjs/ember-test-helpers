class TestMetadata {
  testName;
  setupTypes;
  usedHelpers;
  constructor() {
    this.setupTypes = [];
    this.usedHelpers = [];
  }
  get isRendering() {
    return this.setupTypes.indexOf('setupRenderingContext') > -1 && this.usedHelpers.indexOf('render') > -1;
  }
  get isApplication() {
    return this.setupTypes.indexOf('setupApplicationContext') > -1;
  }
}

// Only export the type side of the item: this way the only way (it is legal) to
// construct it is here, but users can still reference the type.

const TEST_METADATA = new WeakMap();

/**
 * Gets the test metadata associated with the provided test context. Will create
 * a new test metadata object if one does not exist.
 *
 * @param {BaseContext} context the context to use
 * @returns {TestMetadata} the test metadata for the provided context
 */
function getTestMetadata(context) {
  if (!TEST_METADATA.has(context)) {
    TEST_METADATA.set(context, new TestMetadata());
  }
  return TEST_METADATA.get(context);
}

export { TestMetadata as __TestMetadata, getTestMetadata as default };
//# sourceMappingURL=test-metadata.js.map
