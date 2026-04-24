import { type Target } from './-target.ts';
/**
  Used internally by the DOM interaction helpers to find either window or an element.

  @private
  @param {string|Element} target the window, an element or selector to retrieve
  @returns {Element|Window} the target or selector
*/
export declare function getWindowOrElement(target: Target): Element | Document | Window | null;
//# sourceMappingURL=-get-window-or-element.d.ts.map