import { BaseContext } from './setup-context';

export interface ITestMetadata {
  testName?: string;
  setupTypes: string[];
  usedHelpers: string[];
  [key: string]: any;

  readonly isRendering: boolean;
  readonly isApplication: boolean;
}

export class TestMetadata implements ITestMetadata {
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

const TEST_METADATA = new WeakMap<BaseContext, ITestMetadata>();

/**
 * Gets the test metadata associated with the provided test context. Will create
 * a new test metadata object if one does not exist.
 *
 * @param {BaseContext} context the context to use
 * @returns {ITestMetadata} the test metadata for the provided context
 */
export default function getTestMetadata(context: BaseContext): ITestMetadata {
  if (!TEST_METADATA.has(context)) {
    TEST_METADATA.set(context, new TestMetadata());
  }

  return TEST_METADATA.get(context)!;
}
