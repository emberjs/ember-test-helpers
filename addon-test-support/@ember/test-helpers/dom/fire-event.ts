import { FilterKeysByType } from '../-filter-keys-by-type';
import { isDocument, isElement, isWindow } from './-target';
import tuple from '../-tuple';
import Target from './-target';
import { log } from '@ember/test-helpers/dom/-logging';
import { runHooks, registerHook } from '../-internal/helper-hooks';

registerHook('fireEvent', 'start', (target: Target) => {
  log('fireEvent', target);
});

// eslint-disable-next-line require-jsdoc
const MOUSE_EVENT_CONSTRUCTOR = (() => {
  try {
    new MouseEvent('test');
    return true;
  } catch (e) {
    return false;
  }
})();
const DEFAULT_EVENT_OPTIONS = { bubbles: true, cancelable: true };

export const KEYBOARD_EVENT_TYPES = tuple('keydown', 'keypress', 'keyup');
export type KeyboardEventType = typeof KEYBOARD_EVENT_TYPES[number];

// eslint-disable-next-line require-jsdoc
export function isKeyboardEventType(
  eventType: unknown
): eventType is KeyboardEventType {
  return (
    typeof eventType === 'string' &&
    KEYBOARD_EVENT_TYPES.includes(eventType as KeyboardEventType)
  );
}

const MOUSE_EVENT_TYPES = tuple(
  'click',
  'mousedown',
  'mouseup',
  'dblclick',
  'mouseenter',
  'mouseleave',
  'mousemove',
  'mouseout',
  'mouseover'
);
export type MouseEventType = typeof MOUSE_EVENT_TYPES[number];

// eslint-disable-next-line require-jsdoc
export function isMouseEventType(
  eventType: unknown
): eventType is MouseEventType {
  return (
    typeof eventType === 'string' &&
    MOUSE_EVENT_TYPES.includes(eventType as MouseEventType)
  );
}

const FILE_SELECTION_EVENT_TYPES = tuple('change');
export type FileSelectionEventType = typeof FILE_SELECTION_EVENT_TYPES[number];

// eslint-disable-next-line require-jsdoc
export function isFileSelectionEventType(
  eventType: unknown
): eventType is FileSelectionEventType {
  return (
    typeof eventType === 'string' &&
    FILE_SELECTION_EVENT_TYPES.includes(eventType as FileSelectionEventType)
  );
}

export interface HTMLFileInputElement extends HTMLInputElement {
  files: FileList;
}

// eslint-disable-next-line require-jsdoc
export function isFileSelectionInput(
  element: unknown
): element is HTMLFileInputElement {
  return element instanceof HTMLInputElement && element.files !== null;
}

export interface FileSelectionEventOptions extends EventInit {
  files?: File[] | null | undefined;
}

// Global Event overloads
function fireEvent(
  element: Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, Event>,
  options?: EventInit
): Promise<Event>;
function fireEvent(
  element: Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, AnimationEvent>,
  options?: AnimationEventInit
): Promise<Event>;
function fireEvent(
  element: Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, FocusEvent>,
  options?: FocusEventInit
): Promise<Event>;
function fireEvent(
  element: Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, CompositionEvent>,
  options?: CompositionEventInit
): Promise<Event>;
function fireEvent(
  element: Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, DragEvent>,
  options?: DragEventInit
): Promise<Event>;
function fireEvent(
  element: Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, ErrorEvent>,
  options?: ErrorEventInit
): Promise<Event>;
function fireEvent(
  element: Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, FocusEvent>,
  options?: FocusEventInit
): Promise<Event>;
function fireEvent(
  element: Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, FormDataEvent>,
  options?: FormDataEventInit
): Promise<Event>;
function fireEvent(
  element: Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, InputEvent>,
  options?: InputEventInit
): Promise<Event>;
function fireEvent(
  element: Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, KeyboardEvent>,
  options?: KeyboardEventInit
): Promise<Event>;
function fireEvent(
  element: Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, MouseEvent>,
  options?: MouseEventInit
): Promise<Event>;
function fireEvent(
  element: Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, PointerEvent>,
  options?: PointerEventInit
): Promise<Event>;
function fireEvent(
  element: Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, ProgressEvent>,
  options?: ProgressEventInit
): Promise<Event>;
function fireEvent(
  element: Element | Document | Window,
  eventType: FilterKeysByType<
    GlobalEventHandlersEventMap,
    SecurityPolicyViolationEvent
  >,
  options?: SecurityPolicyViolationEventInit
): Promise<Event>;
function fireEvent(
  element: Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, SubmitEvent>,
  options?: SubmitEventInit
): Promise<Event>;
function fireEvent(
  element: Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, TouchEvent>,
  options?: TouchEventInit
): Promise<Event>;
function fireEvent(
  element: Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, TransitionEvent>,
  options?: TransitionEventInit
): Promise<Event>;
function fireEvent(
  element: Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, UIEvent>,
  options?: UIEventInit
): Promise<Event>;
function fireEvent(
  element: Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, WheelEvent>,
  options?: WheelEventInit
): Promise<Event>;

// Window Event overloads
function fireEvent(
  element: Window,
  eventType: FilterKeysByType<WindowEventHandlersEventMap, Event>,
  options?: EventInit
): Promise<Event>;
function fireEvent(
  element: Window,
  eventType: FilterKeysByType<WindowEventHandlersEventMap, BeforeUnloadEvent>
): Promise<Event>;
function fireEvent(
  element: Window,
  eventType: FilterKeysByType<WindowEventHandlersEventMap, GamepadEvent>,
  options?: GamepadEventInit
): Promise<Event>;
function fireEvent(
  element: Window,
  eventType: FilterKeysByType<WindowEventHandlersEventMap, HashChangeEvent>,
  options?: HashChangeEventInit
): Promise<Event>;
function fireEvent(
  element: Window,
  eventType: FilterKeysByType<WindowEventHandlersEventMap, MessageEvent>,
  options?: MessageEventInit
): Promise<Event>;
function fireEvent(
  element: Window,
  eventType: FilterKeysByType<WindowEventHandlersEventMap, PageTransitionEvent>,
  options?: PageTransitionEventInit
): Promise<Event>;
function fireEvent(
  element: Window,
  eventType: FilterKeysByType<WindowEventHandlersEventMap, PopStateEvent>,
  options?: PopStateEventInit
): Promise<Event>;
function fireEvent(
  element: Window,
  eventType: FilterKeysByType<
    WindowEventHandlersEventMap,
    PromiseRejectionEvent
  >,
  options?: PromiseRejectionEventInit
): Promise<Event>;
function fireEvent(
  element: Window,
  eventType: FilterKeysByType<WindowEventHandlersEventMap, StorageEvent>,
  options?: StorageEventInit
): Promise<Event>;

// Document or Element overloads
function fireEvent(
  element: Document | Element,
  eventType: FilterKeysByType<
    DocumentAndElementEventHandlersEventMap,
    ClipboardEvent
  >,
  options?: ClipboardEventInit
): Promise<Event>;

// Document event overloads
function fireEvent(
  element: Document,
  eventType: FilterKeysByType<DocumentEventMap, Event>,
  options?: EventInit
): Promise<Event>;

// Element event overloads
function fireEvent(
  element: Element,
  eventType: FilterKeysByType<ElementEventMap, Event>,
  options?: EventInit
): Promise<Event>;

// Special casing for File Input change events
function fireEvent(
  element: HTMLFileInputElement,
  eventType: FileSelectionEventType,
  options?: FileSelectionEventOptions
): Promise<Event>;

// Custom event overloads
function fireEvent(
  element: Element | Document | Window,
  eventType: string,
  options?: CustomEventInit<unknown>
): Promise<Event>;

/**
  Internal helper used to build and dispatch events throughout the other DOM helpers.

  @private
  @param {Element} element the element to dispatch the event to
  @param {string} eventType the type of event
  @param {Object} [options] additional properties to be set on the event
  @returns {Event} the event that was dispatched
*/
function fireEvent(
  element: Element | Document | Window,
  eventType: string,
  options: EventInit = {}
): Promise<Event> {
  return Promise.resolve()
    .then(() => runHooks('fireEvent', 'start', element))
    .then(() => runHooks(`fireEvent:${eventType}`, 'start', element))
    .then(() => {
      if (!element) {
        throw new Error('Must pass an element to `fireEvent`');
      }

      let event: Event;
      if (isKeyboardEventType(eventType)) {
        event = _buildKeyboardEvent(eventType, options);
      } else if (isMouseEventType(eventType)) {
        let rect;
        if (isWindow(element) && element.document.documentElement) {
          rect = element.document.documentElement.getBoundingClientRect();
        } else if (isDocument(element)) {
          rect = element.documentElement.getBoundingClientRect();
        } else if (isElement(element)) {
          rect = element.getBoundingClientRect();
        } else {
          throw new Error('Could not determine coordinates for MouseEventInit');
        }

        let x = rect.left + 1;
        let y = rect.top + 1;
        let simulatedCoordinates: MouseEventInit = {
          screenX: x + 5, // Those numbers don't really mean anything.
          screenY: y + 95, // They're just to make the screenX/Y be different of clientX/Y..
          clientX: x,
          clientY: y,
          ...options,
        };

        event = buildMouseEvent(eventType, simulatedCoordinates);
      } else if (
        isFileSelectionEventType(eventType) &&
        isFileSelectionInput(element)
      ) {
        event = buildFileEvent(eventType, element, options);
      } else {
        event = buildBasicEvent(eventType, options);
      }

      element.dispatchEvent(event);
      return event;
    })
    .then((event) =>
      runHooks(`fireEvent:${eventType}`, 'end', element).then(() => event)
    )
    .then((event) => runHooks('fireEvent', 'end', element).then(() => event));
}

export default fireEvent;

// eslint-disable-next-line require-jsdoc
function buildBasicEvent(type: string, _options: EventInit = {}): Event {
  let options: EventInit = {
    ...DEFAULT_EVENT_OPTIONS,
    ..._options,
  };

  try {
    return new Event(type, options);
  } catch {
    let event = document.createEvent('Events');

    let { bubbles, cancelable } = options;

    delete options.bubbles;
    delete options.cancelable;

    // bubbles and cancelable are readonly, so they can be
    // set when initializing event
    event.initEvent(type, bubbles, cancelable);
    for (let prop in options) {
      (event as any)[prop] = (options as Record<string, unknown>)[prop];
    }
    return event;
  }
}

// eslint-disable-next-line require-jsdoc
function buildMouseEvent(type: MouseEventType, options: MouseEventInit = {}) {
  let event;
  let eventOpts = {
    view: window,
    ...DEFAULT_EVENT_OPTIONS,
    ...options,
  };
  if (MOUSE_EVENT_CONSTRUCTOR) {
    event = new MouseEvent(type, eventOpts);
  } else {
    try {
      event = document.createEvent('MouseEvents');
      event.initMouseEvent(
        type,
        eventOpts.bubbles,
        eventOpts.cancelable,
        eventOpts.view ?? window,
        eventOpts.detail ?? 0,
        eventOpts.screenX ?? 0,
        eventOpts.screenY ?? 0,
        eventOpts.clientX ?? 0,
        eventOpts.clientY ?? 0,
        eventOpts.ctrlKey ?? false,
        eventOpts.altKey ?? false,
        eventOpts.shiftKey ?? false,
        eventOpts.metaKey ?? false,
        eventOpts.button ?? 0,
        eventOpts.relatedTarget ?? null
      );
    } catch (e) {
      event = buildBasicEvent(type, options);
    }
  }

  return event;
}

// @private
// eslint-disable-next-line require-jsdoc
export function _buildKeyboardEvent(
  type: KeyboardEventType,
  options: KeyboardEventInit = {}
) {
  let eventOpts: KeyboardEventInit = {
    ...DEFAULT_EVENT_OPTIONS,
    ...options,
  };
  let event: KeyboardEvent | Event | undefined;

  try {
    event = new KeyboardEvent(type, eventOpts);

    Object.defineProperty(event, 'keyCode', {
      get() {
        return extractKeyInfo('keyCode', eventOpts);
      },
    });

    Object.defineProperty(event, 'which', {
      get() {
        return extractKeyInfo('which', eventOpts);
      },
    });

    return event;
  } catch (e) {
    // left intentionally blank
  }

  try {
    event = document.createEvent('KeyboardEvents');
    (event as KeyboardEvent).initKeyboardEvent(
      type,
      eventOpts.bubbles,
      eventOpts.cancelable,
      window,
      eventOpts.key,
      eventOpts.location,
      eventOpts.ctrlKey,
      eventOpts.altKey,
      eventOpts.shiftKey,
      eventOpts.metaKey
    );
    return event;
  } catch (e) {
    // left intentionally blank
  }

  if (!event) {
    try {
      event = document.createEvent('KeyEvents');
      // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/initKeyEvent
      // @ts-expect-error This method is so long deprecated that TS doesn't know about it
      (event as KeyboardEvent).initKeyEvent(
        type,
        eventOpts.bubbles,
        eventOpts.cancelable,
        window,
        eventOpts.ctrlKey,
        eventOpts.altKey,
        eventOpts.shiftKey,
        eventOpts.metaKey,
        eventOpts.keyCode
      );
      return event;
    } catch (e) {
      // left intentionally blank
    }
  }

  if (!event) {
    event = buildBasicEvent(type, options);
  }

  return event;
}

// Property definitions are required for B/C for keyboard event usage
// If this properties are not defined, when listening for key events
// keyCode/which will be 0. Also, keyCode and which now are string
// and if app compare it with === with integer key definitions,
// there will be a fail.
//
// https://w3c.github.io/uievents/#interface-keyboardevent
// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
// eslint-disable-next-line require-jsdoc
function extractKeyInfo(prop: 'keyCode' | 'which', options: KeyboardEventInit) {
  let value = options[prop];
  if (typeof value === 'number') {
    return value;
  } else if (value === null || value === undefined) {
    return undefined;
  } else if (typeof value === 'string') {
    let int = parseInt(value);
    if (Number.isNaN(int)) {
      throw new Error(`event.${prop} parsed to NaN`);
    }
    return int;
  } else {
    throw new Error(
      `event.${prop} type not supported, value was ${options[prop]}`
    );
  }
}

// eslint-disable-next-line require-jsdoc
function buildFileEvent(
  type: FileSelectionEventType,
  element: HTMLFileInputElement,
  options: FileSelectionEventOptions = {}
): Event {
  let event = buildBasicEvent(type);
  let files = options.files;

  if (Array.isArray(options)) {
    throw new Error(
      'Please pass an object with a files array to `triggerEvent` instead of passing the `options` param as an array to.'
    );
  }

  if (Array.isArray(files)) {
    Object.defineProperty(files, 'item', {
      value(index: number) {
        return typeof index === 'number' ? this[index] : null;
      },
      configurable: true,
    });
    Object.defineProperty(element, 'files', {
      value: files,
      configurable: true,
    });

    let elementProto: unknown = Object.getPrototypeOf(element);
    let valueProp = Object.getOwnPropertyDescriptor(elementProto, 'value');
    Object.defineProperty(element, 'value', {
      configurable: true,
      get() {
        return valueProp!.get!.call(element);
      },
      set(value) {
        valueProp!.set!.call(element, value);

        // We are sure that the value is empty here.
        // For a non-empty value the original setter must raise an exception.
        Object.defineProperty(element, 'files', {
          configurable: true,
          value: [],
        });
      },
    });
  }

  Object.defineProperty(event, 'target', {
    value: element,
  });

  return event;
}
