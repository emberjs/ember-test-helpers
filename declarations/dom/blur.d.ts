import type { Target } from './-target.ts';
/**
  @private
  @param {Element} element the element to trigger events on
  @param {Element} relatedTarget the element that is focused after blur
  @return {Promise<Event | void>} resolves when settled
*/
export declare function __blur__(element: HTMLElement | Element | Document | SVGElement, relatedTarget?: HTMLElement | Element | Document | SVGElement | null): Promise<Event | void>;
/**
  Unfocus the specified target.

  Sends a number of events intending to simulate a "real" user unfocusing an
  element.

  The following events are triggered (in order):

  - `blur`
  - `focusout`

  The exact listing of events that are triggered may change over time as needed
  to continue to emulate how actual browsers handle unfocusing a given element.

  @public
  @param {string|Element|IDOMElementDescriptor} [target=document.activeElement] the element, selector, or descriptor to unfocus
  @return {Promise<void>} resolves when settled

  @example
  <caption>
    Emulating blurring an input using `blur`
  </caption>

  blur('input');
*/
export default function blur(target?: Target): Promise<void>;
//# sourceMappingURL=blur.d.ts.map