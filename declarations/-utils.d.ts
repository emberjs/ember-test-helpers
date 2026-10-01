export declare const nextTick: (cb: () => void) => Promise<void>;
export declare const futureTick: typeof setTimeout;
/**
 Retrieves an array of destroyables from the specified property on the object
 provided, iterates that array invoking each function, then deleting the
 property (clearing the array).

 @private
 @param {Object} object an object to search for the destroyable array within
 @param {string} property the property on the object that contains the destroyable array
*/
export declare function runDestroyablesFor(object: any, property: string): void;
/**
 Returns whether the passed in string consists only of numeric characters.

 @private
 @param {string} n input string
 @returns {boolean} whether the input string consists only of numeric characters
 */
export declare function isNumeric(n: string): boolean;
/**
  Checks if an element is considered visible by the focus area spec.

  @private
  @param {Element} element the element to check
  @returns {boolean} `true` when the element is visible, `false` otherwise
*/
export declare function isVisible(element: Element): boolean;
/**
  Checks if an element is disabled.

  @private
  @param {Element} element the element to check
  @returns {boolean} `true` when the element is disabled, `false` otherwise
*/
export declare function isDisabled(element: HTMLElement): boolean;
//# sourceMappingURL=-utils.d.ts.map