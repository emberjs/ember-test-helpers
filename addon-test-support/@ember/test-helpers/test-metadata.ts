import { BaseContext } from './setup-context';

export interface ITestMetadata {
  testName?: string;
  types: string[];
  [key: string]: any;
}

export class TestMetadata implements ITestMetadata {
  [key: string]: any;
  testName?: string;
  types: string[];

  constructor() {
    this.types = [];
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
