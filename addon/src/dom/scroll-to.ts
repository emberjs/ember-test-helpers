import getElement from './-get-element.ts';
import fireEvent from './fire-event.ts';
import settled from '../settled.ts';
import type { Target } from './-target.ts';
import { isDocument, isElement } from './-target.ts';
import { runHooks } from '../helper-hooks.ts';
import type { IDOMElementDescriptor } from 'dom-element-descriptors';
import getDescription from './-get-description.ts';

// eslint-disable-next-line require-jsdoc
function errorMessage(message: string, target: Target) {
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
export default function scrollTo(
  target: string | HTMLElement | IDOMElementDescriptor,
  x: number,
  y: number,
): Promise<void> {
  return Promise.resolve()
    .then(() => runHooks('scrollTo', 'start', target))
    .then(() => {
      if (!target) {
        throw new Error(
          'Must pass an element, selector, or descriptor to `scrollTo`.',
        );
      }

      if (x === undefined || y === undefined) {
        throw new Error('Must pass both x and y coordinates to `scrollTo`.');
      }

      const element = getElement(target);
      if (!element) {
        throw new Error(errorMessage('Element not found', target));
      }

      if (!isElement(element)) {
        let nodeType: string;
        if (isDocument(element)) {
          nodeType = 'Document';
        } else {
          // This is an error check for non-typescript callers passing in the
          // wrong type for `target`, so we have to cast `element` (which is
          // `never` inside this block) to something that will allow us to
          // access `nodeType`.
          const notElement = element as { nodeType: string };
          nodeType = notElement.nodeType;
        }

        throw new Error(
          errorMessage(
            `"target" must be an element, but was a ${nodeType}`,
            target,
          ),
        );
      }

      element.scrollTop = y;
      element.scrollLeft = x;

      return fireEvent(element, 'scroll').then(settled);
    })
    .then(() => runHooks('scrollTo', 'end', target));
}
