import { getContext } from '../setup-context';

export default function getElement(selectorOrElement) {
  if (
    selectorOrElement instanceof Window ||
    selectorOrElement instanceof Document ||
    selectorOrElement instanceof HTMLElement ||
    selectorOrElement instanceof SVGElement
  ) {
    return selectorOrElement;
  } else if (typeof selectorOrElement === 'string') {
    let rootElement = getContext().element;

    return rootElement.querySelector(selectorOrElement);
  } else {
    throw new Error('Must use an element or a selector string');
  }

}
