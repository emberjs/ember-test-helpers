import getElement from './-get-element';
import Target, { isWindow } from './-target';

/**
  Used internally by the DOM interaction helpers to find either window or an element.

  @private
  @param {string|Element} target the window, an element or selector to retrieve
  @returns {Element|Window} the target or selector
*/
export function getWindowOrElement(
  target: Target
): Element | Document | Window | null {
  if (isWindow(target)) {
    return target as Window;
  }

  return getElement(target);
}
