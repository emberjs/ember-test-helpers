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

  let rootElementSelector;
  // When the host app uses `setApplication` (instead of `setResolver`) the owner has
  // a `rootElement` set on it with the element id to be used
  if (owner && owner._emberTestHelpersMockOwner === undefined) {
    rootElementSelector = owner.rootElement;
  } else {
    rootElementSelector = '#ember-testing';
  }

  let rootElement = document.querySelector(rootElementSelector);

  return rootElement;
}
