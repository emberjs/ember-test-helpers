/* globals global */

export default (() => {
  if (typeof self !== 'undefined') {
    return self;
  } else if (typeof window !== 'undefined') {
    return window;
    // @ts-expect-error
  } else if (typeof global !== 'undefined') {
    // @ts-expect-error
    return global;
  } else {
    return Function('return this')();
  }
})();
