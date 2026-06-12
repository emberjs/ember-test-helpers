import getElement from './-get-element.js';
import { isWindow } from './-target.js';

/**
  Used internally by the DOM interaction helpers to find either window or an element.

  @private
  @param {string|Element} target the window, an element or selector to retrieve
  @returns {Element|Window} the target or selector
*/
function getWindowOrElement(target) {
  if (isWindow(target)) {
    return target;
  }
  return getElement(target);
}

export { getWindowOrElement };
//# sourceMappingURL=-get-window-or-element.js.map
