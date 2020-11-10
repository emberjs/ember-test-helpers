import Target from './-target';

/**
 * @private
 * @param {Target} maybeWindow the target that is possibly the window
 * @returns {boolean} `true` when the target is window, `false` otherwise
 */
export default function isWindow(maybeWindow: Target): boolean {
  return maybeWindow instanceof Window;
}
