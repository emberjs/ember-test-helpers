/* globals global */

var global$1 = (() => {
  if (typeof self !== 'undefined') {
    return self;
  } else if (typeof window !== 'undefined') {
    return window;
    // @ts-ignore -- global does not exist
  } else if (typeof global !== 'undefined') {
    // @ts-ignore -- global does not exist
    return global;
  } else {
    return Function('return this')();
  }
})();

export { global$1 as default };
//# sourceMappingURL=global.js.map
