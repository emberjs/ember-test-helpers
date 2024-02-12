import getRootElement from './get-root-element';
import Target, { isDocument, isElement } from './-target';
import {
  type IDOMElementDescriptor,
  lookupDescriptorData,
  resolveDOMElement,
} from 'dom-element-descriptors';

function getElement<
  K extends keyof (HTMLElementTagNameMap | SVGElementTagNameMap)
>(target: K): (HTMLElementTagNameMap[K] | SVGElementTagNameMap[K]) | null;
function getElement<K extends keyof HTMLElementTagNameMap>(
  target: K
): HTMLElementTagNameMap[K] | null;
function getElement<K extends keyof SVGElementTagNameMap>(
  target: K
): SVGElementTagNameMap[K] | null;
function getElement(target: string): Element | null;
function getElement(target: Element): Element;
function getElement(target: IDOMElementDescriptor): Element | null;
function getElement(target: Document): Document;
function getElement(target: Window): Document;
function getElement(target: string | IDOMElementDescriptor): Element | null;
function getElement(target: Target): Element | Document | null;
/**
  Used internally by the DOM interaction helpers to find one element.

  @private
  @param {string|Element} target the element or selector to retrieve
  @returns {Element} the target or selector
*/
function getElement(target: Target): Element | Document | null {
  if (typeof target === 'string') {
    let rootElement = getRootElement();

    return rootElement.querySelector(target);
  } else if (isElement(target) || isDocument(target)) {
    return target;
  } else if (target instanceof Window) {
    return target.document;
  } else {
    let descriptorData = lookupDescriptorData(target);
    if (descriptorData) {
      return resolveDOMElement(descriptorData);
    } else {
      throw new Error(
        'Must use an element, selector string, or DOM element descriptor'
      );
    }
  }
}

export default getElement;
