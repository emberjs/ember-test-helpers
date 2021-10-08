import triggerEvent from './trigger-event';

/**
  Drag and drop

  Simulates a drag and drop movement from a draggable source element that is dropped on a drop target element

  @public
  @param {element} draggableStartElement - the element or selector that the drag and drop begins on
  @param {element} dropTargetElement - element the element or selector that receives the drop
  @returns {promise} returns event with dataTransfer object
*/
export default function dragMove(
  draggableStartElement: HTMLElement | string,
  dropTargetElement: HTMLElement | string
) {
  const context: Record<string, string> = {};

  return triggerEvent(draggableStartElement, 'dragstart', {
    dataTransfer: {
      setData(someKey: string, value: string) {
        context[someKey] = value;
      },
    },
  }).then(() => {
    return triggerEvent(dropTargetElement, 'dragover').then(() => {
      return triggerEvent(dropTargetElement, 'drop', {
        dataTransfer: {
          getData(someKey: string) {
            return context[someKey];
          },
        },
      });
    });
  });
}
