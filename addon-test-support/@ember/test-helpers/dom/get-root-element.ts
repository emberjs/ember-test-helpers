import { getContext } from '../setup-context';

/**
  Get the root element of the application under test (usually `#ember-testing`)

  @public
  @returns {Element} the root element
*/
export default function getRootElement() {
  let context = getContext();
  let owner = context && context.owner;

  if (!owner) {
    throw new Error('Must setup rendering context before attempting to interact with elements.');
  }

  let rootElement;
  // When the host app uses `setApplication` (instead of `setResolver`) the owner has
  // a `rootElement` set on it with the element or id to be used
  if (owner && owner._emberTestHelpersMockOwner === undefined) {
    rootElement = owner.rootElement;
  } else {
    rootElement = '#ember-testing';
  }

  if (
    rootElement.nodeType === Node.ELEMENT_NODE ||
    rootElement.nodeType === Node.DOCUMENT_NODE ||
    rootElement instanceof Window
  ) {
    return rootElement;
  } else if (typeof rootElement === 'string') {
    return document.querySelector(rootElement);
  } else {
    throw new Error('Application.rootElement must be an element or a selector string');
  }
}
