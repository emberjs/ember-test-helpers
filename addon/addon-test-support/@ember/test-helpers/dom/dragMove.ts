import { settled } from '..';
import { registerHook, runHooks } from '../helper-hooks';
import getElement from './-get-element';
import { log } from './-logging';
import Target from './-target';
import fireEvent from './fire-event';

registerHook('fillIn', 'start', (target: Target, text: string) => {
  log('fillIn', target, text);
});

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

  return Promise.resolve()
    .then(() =>
      runHooks('dragMove', 'start', draggableStartElement, dropTargetElement)
    )
    .then(() => {
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

      const targetEl = getElement(draggableStartElement) as
        | Element
        | HTMLElement;

      fireEvent(dragEl, 'dragstart', {
        dataTransfer: {
          setData(someKey: string, value: string) {
            context[someKey] = value;
          },
        },
      });

      fireEvent(targetEl, 'dragover');

      fireEvent(targetEl, 'drop', {
        dataTransfer: {
          getData(someKey: string) {
            return context[someKey];
          },
        },
      });

      return settled();
    })
    .then(() =>
      runHooks('moveDrag', 'end', draggableStartElement, dropTargetElement)
    );
}
