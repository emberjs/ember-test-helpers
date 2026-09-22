// eslint-disable-next-line require-jsdoc
function isElement(target) {
  return target !== null && typeof target === 'object' && Reflect.get(target, 'nodeType') === Node.ELEMENT_NODE;
}

// eslint-disable-next-line require-jsdoc
function isWindow(target) {
  return target instanceof Window;
}

// eslint-disable-next-line require-jsdoc
function isDocument(target) {
  return target !== null && typeof target === 'object' && Reflect.get(target, 'nodeType') === Node.DOCUMENT_NODE;
}

// eslint-disable-next-line require-jsdoc
function isContentEditable(element) {
  return 'isContentEditable' in element && element.isContentEditable;
}

export { isContentEditable, isDocument, isElement, isWindow };
//# sourceMappingURL=-target.js.map
