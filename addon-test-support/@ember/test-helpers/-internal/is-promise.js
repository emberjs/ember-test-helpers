/**
 *
 * detect if a value appears to be a promise
 *
 * @private
 * @param {any} [maybePromise] the value being considered to be a promise
 * @return {boolean} true if the value appears to be a promise, or false otherwise
 */
export default function (maybePromise) {
  return maybePromise !== null && (typeof maybePromise === 'object' || typeof maybePromise === 'function') && typeof maybePromise.then === 'function';
}