import { getContext, isTestContext } from '../setup-context';
import { isDocument, isElement } from './-target';

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
export default function getRootElement(): Element | Document {
  let context = getContext();

  if (!context || !isTestContext(context) || !context.owner) {
    throw new Error(
      'Must setup rendering context before attempting to interact with elements.'
    );
  }

  let owner = context.owner;

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
    let _rootElement = document.querySelector(rootElement);
    if (_rootElement) {
      return _rootElement;
    }

    throw new Error(`Application.rootElement (${rootElement}) not found`);
  } else {
    throw new Error(
      'Application.rootElement must be an element or a selector string'
    );
  }
}
