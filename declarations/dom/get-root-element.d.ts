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
export default function getRootElement(): Element | Document;
//# sourceMappingURL=get-root-element.d.ts.map