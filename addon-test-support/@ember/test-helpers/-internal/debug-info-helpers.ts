export interface DebugInfoHelper {
  hasDebugInfo: () => boolean;
  toConsole: () => void;
}

export const debugInfoHelpers = new Set<DebugInfoHelper>();

/**
 * Registers a custom debug info helper to augment the output for test isolation validation.
 *
 * @public
 * @param {DebugInfoHelper} debugHelper a custom debug info helper
 */
export default function registerDebugInfoHelper(debugHelper: DebugInfoHelper) {
  debugInfoHelpers.add(debugHelper);
}
