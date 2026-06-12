import { type Target } from './-target.ts';
type FocusRecord = {
    focusTarget: HTMLElement | SVGElement;
    previousFocusedElement?: HTMLElement | SVGElement | null;
};
/**
  @private
  @param {Element} element the element to trigger events on
  @return {Promise<FocusRecord | Event | void>} resolves when settled
*/
export declare function __focus__(element: HTMLElement | Element | Document | SVGElement): Promise<FocusRecord | Event | void>;
/**
  Focus the specified target.

  Sends a number of events intending to simulate a "real" user focusing an
  element.

  The following events are triggered (in order):

  - `focus`
  - `focusin`

  The exact listing of events that are triggered may change over time as needed
  to continue to emulate how actual browsers handle focusing a given element.

  @public
  @param {string|Element|IDOMElementDescriptor} target the element, selector, or descriptor to focus
  @return {Promise<void>} resolves when the application is settled

  @example
  <caption>
    Emulating focusing an input using `focus`
  </caption>

  focus('input');
*/
export default function focus(target: Target): Promise<void>;
export {};
//# sourceMappingURL=focus.d.ts.map