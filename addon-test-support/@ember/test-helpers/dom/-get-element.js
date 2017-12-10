import { getContext } from '../setup-context';

export default function getElement(selectorOrElement) {
  if (
    selectorOrElement instanceof Window ||
    selectorOrElement instanceof Document ||
    selectorOrElement instanceof Element
  ) {
    return selectorOrElement;
  } else if (typeof selectorOrElement === 'string') {
    let context = getContext();
    let rootElement = context && context.element;
    if (!rootElement) {
      throw new Error(`Must setup rendering context before attempting to interact with elements.`);
    }

    return rootElement.querySelector(selectorOrElement);
  } else {
    throw new Error('Must use an element or a selector string');
  }
}
