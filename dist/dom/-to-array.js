/**
  @private
  @param {NodeList} nodelist the nodelist to convert to an array
  @returns {Array} an array
*/
function toArray(nodelist) {
  const array = new Array(nodelist.length);
  for (let i = 0; i < nodelist.length; i++) {
    array[i] = nodelist[i];
  }
  return array;
}

export { toArray as default };
//# sourceMappingURL=-to-array.js.map
