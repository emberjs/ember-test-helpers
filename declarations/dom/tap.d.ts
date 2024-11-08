import type { Target } from './-target.ts';
/**
  Taps on the specified target.

  Sends a number of events intending to simulate a "real" user tapping on an
  element.

  For non-focusable elements the following events are triggered (in order):

  - `touchstart`
  - `touchend`
  - `mousedown`
  - `mouseup`
  - `click`

  For focusable (e.g. form control) elements the following events are triggered
  (in order):

  - `touchstart`
  - `touchend`
  - `mousedown`
  - `focus`
  - `focusin`
  - `mouseup`
  - `click`

  The exact listing of events that are triggered may change over time as needed
  to continue to emulate how actual browsers handle tapping on a given element.

  Use the `options` hash to change the parameters of the tap events.

  @public
  @param {string|Element|IDOMElementDescriptor} target the element, selector, or descriptor to tap on
  @param {Object} options the options to be merged into the touch events
  @return {Promise<void>} resolves when settled

  @example
  <caption>
    Emulating tapping a button using `tap`
  </caption>

  tap('button');
*/
export default function tap(target: Target, options?: TouchEventInit): Promise<void>;
//# sourceMappingURL=tap.d.ts.map