import { settled } from '..';
import { registerHook, runHooks } from '../-internal/helper-hooks';
import getElement from './-get-element';
import { log } from './-logging';
import Target from './-target';
import fireEvent from './fire-event';

registerHook(
  'dragMove',
  'start',
  (draggableElement: Target, targetElement: Target) => {
    log('dragMove', draggableElement, targetElement);
  }
);

function delayedExecute(delay: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

/**
  Drag and drop

  Simulates a drag and drop movement from a draggable source element that is dropped on a drop target element

  @public
  @param {element} draggableStartElement - the element or selector that the drag and drop begins on
  @param {element} dropTargetElement - element the element or selector that receives the drop
  @returns {promise} returns event with dataTransfer object
*/
export default function dragMove(
  draggableStartElement: Target,
  dropTargetElement: Target
): Promise<void> {
  const context: Record<string, string> = {};

  if (!draggableStartElement) {
    throw new Error(
      `Element not found: ${draggableStartElement}. Must pass an element or selector.`
    );
  }
  if (!dropTargetElement) {
    throw new Error(
      `Element not found: ${dropTargetElement}. Must pass an element or selector.`
    );
  }

  const dragEl = getElement(draggableStartElement) as Element | HTMLElement;

  const targetEl = getElement(draggableStartElement) as Element | HTMLElement;

  return Promise.resolve()
    .then(() =>
      runHooks('dragMove', 'start', draggableStartElement, dropTargetElement)
    )
    .then(() => {
      fireEvent(dragEl, 'dragstart', {
        dataTransfer: {
          setData(someKey: string, value: string) {
            context[someKey] = value;
          },
        },
      });

      console.log('fire');

      fireEvent(targetEl, 'dragover');

      console.log('fire');

      fireEvent(targetEl, 'dragenter');

      console.log('fire');

      fireEvent(targetEl, 'drop', {
        dataTransfer: {
          getData(someKey: string) {
            return context[someKey];
          },
        },
      });

      console.log('fire');

      return settled();
    })
    .then(() =>
      runHooks('dragMove', 'end', draggableStartElement, dropTargetElement)
    );
}
