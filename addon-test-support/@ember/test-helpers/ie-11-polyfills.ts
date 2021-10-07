// @ts-nocheck
/**
 * Polyfills Array.prototype.find for ie11 without mocking the app during test execution
 * @param {array} array to find an element
 * @param {predicate} predicate function to find the element
 * @returns {(number | string | array | function)} found element inside the array
 */
export function find<T>(array: Array<T>, predicate: Function) {
  return Array.prototype.find
    ? array.find(predicate)
    : array.filter(predicate)[0];
}

/**
 * Polyfills Array.from for ie11 without mocking the app during test execution
 * @param {array} nodeList like data structure(e.g. NodeList)
 * @returns {array} parameter converted to a JS array
 */
export function toArray<T extends Node>(nodeList: NodeListOf<T>): T[] {
  return Array.from ? Array.from(nodeList) : toArrayPolyfill(nodeList);
}

/**
 * @private
 * Polyfills Array.from for ie11 without mocking the app during test execution
 * @param {array} nodeList like data structure(e.g. NodeList)
 * @returns {array} parameter converted to a JS array
 */
function toArrayPolyfill<T extends Node>(nodeList: NodeListOf<T>): T[] {
  let array = new Array(nodeList.length);
  for (let i = 0; i < nodeList.length; i++) {
    array[i] = nodeList[i];
  }

  return array;
}

/**
 * @private
 * Object.assign fallback
 * @param {object} source
 * @param {object} target
 * @returns {object}
 */
 export function assign<T, U>(target: T, source: U): T & U;
 export function assign<T, U, V>(target: T, source: U, source1: V): T & U & V;
 export function assign<object, object>(source: object, ...rest: object[]): Object {
  return Object.assign ? Object.assign(source, ...rest) : Ember.assign(source, ...rest);
}
