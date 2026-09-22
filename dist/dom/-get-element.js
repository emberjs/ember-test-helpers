import getRootElement from './get-root-element.js';
import { isElement, isDocument } from './-target.js';
import { lookupDescriptorData, resolveDOMElement } from 'dom-element-descriptors';

/**
  Used internally by the DOM interaction helpers to find one element.

  @private
  @param {string|Element} target the element or selector to retrieve
  @returns {Element} the target or selector
*/
function getElement(target) {
  if (typeof target === 'string') {
    const rootElement = getRootElement();
    return rootElement.querySelector(target);
  } else if (isElement(target) || isDocument(target)) {
    return target;
  } else if (target instanceof Window) {
    return target.document;
  } else {
    const descriptorData = lookupDescriptorData(target);
    if (descriptorData) {
      return resolveDOMElement(descriptorData);
    } else {
      throw new Error('Must use an element, selector string, or DOM element descriptor');
    }
  }
}

export { getElement as default };
//# sourceMappingURL=-get-element.js.map
