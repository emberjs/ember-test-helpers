import getElement from './-get-element.js';
import fireEvent from './fire-event.js';
import { s as settled } from '../setup-context-BSrEM03X.js';
import { isElement, isDocument } from './-target.js';
import { runHooks } from '../helper-hooks.js';
import getDescription from './-get-description.js';

// eslint-disable-next-line require-jsdoc
function errorMessage(message, target) {
  const description = getDescription(target);
  return `${message} when calling \`scrollTo('${description}')\`.`;
}

/**
  Scrolls DOM element, selector, or descriptor to the given coordinates.
  @public
  @param {string|HTMLElement|IDOMElementDescriptor} target the element, selector, or descriptor to trigger scroll on
  @param {Number} x x-coordinate
  @param {Number} y y-coordinate
  @return {Promise<void>} resolves when settled

  @example
  <caption>
    Scroll DOM element to specific coordinates
  </caption>

  scrollTo('#my-long-div', 0, 0); // scroll to top
  scrollTo('#my-long-div', 0, 100); // scroll down
*/
function scrollTo(target, x, y) {
  return Promise.resolve().then(() => runHooks('scrollTo', 'start', target)).then(() => {
    if (!target) {
      throw new Error('Must pass an element, selector, or descriptor to `scrollTo`.');
    }
    if (x === undefined || y === undefined) {
      throw new Error('Must pass both x and y coordinates to `scrollTo`.');
    }
    const element = getElement(target);
    if (!element) {
      throw new Error(errorMessage('Element not found', target));
    }
    if (!isElement(element)) {
      let nodeType;
      if (isDocument(element)) {
        nodeType = 'Document';
      } else {
        // This is an error check for non-typescript callers passing in the
        // wrong type for `target`, so we have to cast `element` (which is
        // `never` inside this block) to something that will allow us to
        // access `nodeType`.
        const notElement = element;
        nodeType = notElement.nodeType;
      }
      throw new Error(errorMessage(`"target" must be an element, but was a ${nodeType}`, target));
    }
    element.scrollTop = y;
    element.scrollLeft = x;
    return fireEvent(element, 'scroll').then(settled);
  }).then(() => runHooks('scrollTo', 'end', target));
}

export { scrollTo as default };
//# sourceMappingURL=scroll-to.js.map
