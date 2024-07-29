export interface DebugInfoHelper {
  name: string;
  log: () => void;
}

export const debugInfoHelpers = new Set<DebugInfoHelper>();

/**
 * Registers a custom debug info helper to augment the output for test isolation validation.
 *
 * @public
 * @param {DebugInfoHelper} debugHelper a custom debug info helper
 * @example
 *
 * import { registerDebugInfoHelper } from '@ember/test-helpers';
 *
 * registerDebugInfoHelper({
 *   name: 'Date override detection',
 *   log() {
 *     if (dateIsOverridden()) {
 *       console.log(this.name);
 *       console.log('The date object has been overridden');
 *     }
 *   }
 * })
 */
export default function registerDebugInfoHelper(debugHelper: DebugInfoHelper) {
  debugInfoHelpers.add(debugHelper);
}
