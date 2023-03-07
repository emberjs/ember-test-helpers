/* globals global */

export default (() => {
  if (typeof self !== 'undefined') {
    return self;
  } else if (typeof window !== 'undefined') {
    return window;
    // @ts-ignore
  } else if (typeof global !== 'undefined') {
    // @ts-ignore
    return global;
  } else {
    return Function('return this')();
  }
})();
