import { isDescriptor, lookupDescriptorData } from 'dom-element-descriptors';

/**
  Used internally by the DOM interaction helpers to get a description of a
  target for debug/error messaging.

  @private
  @param {Target} target the target
  @returns {string} a description of the target
*/
function getDescription(target) {
  const data = isDescriptor(target) ? lookupDescriptorData(target) : null;
  if (data) {
    return data.description || '<unknown descriptor>';
  } else {
    return `${target}`;
  }
}

export { getDescription as default };
//# sourceMappingURL=-get-description.js.map
