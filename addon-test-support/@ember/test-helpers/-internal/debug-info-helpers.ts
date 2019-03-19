export interface DebugInfoHelper {
  toConsole: () => void;
}

export const debugInfoHelpers = new Set<DebugInfoHelper>();

export default function registerDebugInfoHelper(debugHelper: DebugInfoHelper) {
  debugInfoHelpers.add(debugHelper);
}
