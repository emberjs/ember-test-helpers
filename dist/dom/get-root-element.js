import { g as getContext, i as isTestContext } from '../setup-context-BSrEM03X.js';
import { isElement, isDocument } from './-target.js';

/**
  Get the root element of the application under test (usually `#ember-testing`)

  @public
  @returns {Element} the root element

  @example
  <caption>
    Getting the root element of the application and checking that it is equal
    to the element with id 'ember-testing'.
  </caption>
  assert.equal(getRootElement(), document.querySelector('#ember-testing'));
*/
function getRootElement() {
  const context = getContext();
  if (!context || !isTestContext(context) || !context.owner) {
    throw new Error('Must setup rendering context before attempting to interact with elements.');
  }
  const owner = context.owner;
  let rootElement;
  // When the host app uses `setApplication` (instead of `setResolver`) the owner has
  // a `rootElement` set on it with the element or id to be used
  if (owner && owner._emberTestHelpersMockOwner === undefined) {
    rootElement = owner.rootElement;
  } else {
    rootElement = '#ember-testing';
  }
  if (rootElement instanceof Window) {
    rootElement = rootElement.document;
  }
  if (isElement(rootElement) || isDocument(rootElement)) {
    return rootElement;
  } else if (typeof rootElement === 'string') {
    const _rootElement = document.querySelector(rootElement);
    if (_rootElement) {
      return _rootElement;
    }
    throw new Error(`Application.rootElement (${rootElement}) not found`);
  } else {
    throw new Error('Application.rootElement must be an element or a selector string');
  }
}

export { getRootElement as default };
//# sourceMappingURL=get-root-element.js.map
