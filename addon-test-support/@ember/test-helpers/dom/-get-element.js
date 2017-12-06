import { getContext } from '../setup-context';

export default function getElement(selectorOrElement) {
  if (
    selectorOrElement instanceof Window ||
    selectorOrElement instanceof Document ||
    selectorOrElement instanceof HTMLElement ||
    selectorOrElement instanceof SVGElement
  ) {
    return selectorOrElement;
  }

  let rootElement = getContext().element;

  return rootElement.querySelector(selectorOrElement);
}
