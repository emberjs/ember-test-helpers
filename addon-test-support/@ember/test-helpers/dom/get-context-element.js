import getRootElement from './get-root-element';

/**
 Used internally by the DOM interaction helpers to get the appropriate context element based on the context the user passes into the helper.

 @private
 @param {string|Element} context the context element or selector
 @returns {Element} the appropriate context element
 */
export default function getContextElement(context) {
  if (context) {
    if (typeof context === 'string') {
      return getRootElement().querySelector(context);
    } else if (context instanceof Element) {
      return context;
    }
  }
  return getRootElement();
}
