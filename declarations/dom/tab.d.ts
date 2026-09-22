/**
  Emulates the user pressing the tab button.

  Sends a number of events intending to simulate a "real" user pressing tab on their
  keyboard.

  @public
  @param {Object} [options] optional tab behaviors
  @param {boolean} [options.backwards=false] indicates if the the user navigates backwards
  @param {boolean} [options.unRestrainTabIndex=false] indicates if tabbing should throw an error when tabindex is greater than 0
  @return {Promise<void>} resolves when settled

  @example
  <caption>
    Emulating pressing the `TAB` key
  </caption>
  tab();

  @example
  <caption>
    Emulating pressing the `SHIFT`+`TAB` key combination
  </caption>
  tab({ backwards: true });
*/
export default function triggerTab({ backwards, unRestrainTabIndex, }?: {
    backwards?: boolean | undefined;
    unRestrainTabIndex?: boolean | undefined;
}): Promise<void>;
//# sourceMappingURL=tab.d.ts.map