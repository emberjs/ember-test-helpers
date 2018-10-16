import { assign } from '@ember/polyfills';

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
export const KEYBOARD_EVENT_TYPES = Object.freeze(['keydown', 'keypress', 'keyup']);
const MOUSE_EVENT_TYPES = [
  'click',
  'mousedown',
  'mouseup',
  'dblclick',
  'mouseenter',
  'mouseleave',
  'mousemove',
  'mouseout',
  'mouseover',
];
const FILE_SELECTION_EVENT_TYPES = ['change'];

/**
  Internal helper used to build and dispatch events throughout the other DOM helpers.

  @private
  @param {Element} element the element to dispatch the event to
  @param {string} eventType the type of event
  @param {Object} [options] additional properties to be set on the event
  @returns {Event} the event that was dispatched
*/
export default function fireEvent(element, eventType, options = {}) {
  if (!element) {
    throw new Error('Must pass an element to `fireEvent`');
  }

  let event;
  if (KEYBOARD_EVENT_TYPES.indexOf(eventType) > -1) {
    event = buildKeyboardEvent(eventType, options);
  } else if (MOUSE_EVENT_TYPES.indexOf(eventType) > -1) {
    let rect;
    if (element instanceof Window) {
      rect = element.document.documentElement.getBoundingClientRect();
    } else if (element.nodeType === Node.DOCUMENT_NODE) {
      rect = element.documentElement.getBoundingClientRect();
    } else if (element.nodeType === Node.ELEMENT_NODE) {
      rect = element.getBoundingClientRect();
    } else {
      return;
    }

    let x = rect.left + 1;
    let y = rect.top + 1;
    let simulatedCoordinates = {
      screenX: x + 5, // Those numbers don't really mean anything.
      screenY: y + 95, // They're just to make the screenX/Y be different of clientX/Y..
      clientX: x,
      clientY: y,
    };

    event = buildMouseEvent(eventType, assign(simulatedCoordinates, options));
  } else if (FILE_SELECTION_EVENT_TYPES.indexOf(eventType) > -1 && element.files) {
    event = buildFileEvent(eventType, element, options);
  } else {
    event = buildBasicEvent(eventType, options);
  }

  element.dispatchEvent(event);
  return event;
}

// eslint-disable-next-line require-jsdoc
function buildBasicEvent(type, options = {}) {
  let event = document.createEvent('Events');

  let bubbles = options.bubbles !== undefined ? options.bubbles : true;
  let cancelable = options.cancelable !== undefined ? options.cancelable : true;

  delete options.bubbles;
  delete options.cancelable;

  // bubbles and cancelable are readonly, so they can be
  // set when initializing event
  event.initEvent(type, bubbles, cancelable);
  assign(event, options);
  return event;
}

// eslint-disable-next-line require-jsdoc
function buildMouseEvent(type, options = {}) {
  let event;
  let eventOpts = assign({ view: window }, DEFAULT_EVENT_OPTIONS, options);
  if (MOUSE_EVENT_CONSTRUCTOR) {
    event = new MouseEvent(type, eventOpts);
  } else {
    try {
      event = document.createEvent('MouseEvents');
      event.initMouseEvent(
        type,
        eventOpts.bubbles,
        eventOpts.cancelable,
        window,
        eventOpts.detail,
        eventOpts.screenX,
        eventOpts.screenY,
        eventOpts.clientX,
        eventOpts.clientY,
        eventOpts.ctrlKey,
        eventOpts.altKey,
        eventOpts.shiftKey,
        eventOpts.metaKey,
        eventOpts.button,
        eventOpts.relatedTarget
      );
    } catch (e) {
      event = buildBasicEvent(type, options);
    }
  }

  return event;
}

// eslint-disable-next-line require-jsdoc
function buildKeyboardEvent(type, options = {}) {
  let eventOpts = assign({}, DEFAULT_EVENT_OPTIONS, options);
  let event, eventMethodName;

  try {
    event = new KeyboardEvent(type, eventOpts);

    // Property definitions are required for B/C for keyboard event usage
    // If this properties are not defined, when listening for key events
    // keyCode/which will be 0. Also, keyCode and which now are string
    // and if app compare it with === with integer key definitions,
    // there will be a fail.
    //
    // https://w3c.github.io/uievents/#interface-keyboardevent
    // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
    Object.defineProperty(event, 'keyCode', {
      get() {
        return parseInt(eventOpts.keyCode);
      },
    });

    Object.defineProperty(event, 'which', {
      get() {
        return parseInt(eventOpts.which);
      },
    });

    return event;
  } catch (e) {
    // left intentionally blank
  }

  try {
    event = document.createEvent('KeyboardEvents');
    eventMethodName = 'initKeyboardEvent';
  } catch (e) {
    // left intentionally blank
  }

  if (!event) {
    try {
      event = document.createEvent('KeyEvents');
      eventMethodName = 'initKeyEvent';
    } catch (e) {
      // left intentionally blank
    }
  }

  if (event) {
    event[eventMethodName](
      type,
      eventOpts.bubbles,
      eventOpts.cancelable,
      window,
      eventOpts.ctrlKey,
      eventOpts.altKey,
      eventOpts.shiftKey,
      eventOpts.metaKey,
      eventOpts.keyCode,
      eventOpts.charCode
    );
  } else {
    event = buildBasicEvent(type, options);
  }

  return event;
}

// eslint-disable-next-line require-jsdoc
function buildFileEvent(type, element, files = []) {
  let event = buildBasicEvent(type);

  if (files.length > 0) {
    Object.defineProperty(files, 'item', {
      value(index) {
        return typeof index === 'number' ? this[index] : null;
      },
    });
    Object.defineProperty(element, 'files', {
      value: files,
      configurable: true,
    });
  }

  Object.defineProperty(event, 'target', {
    value: element,
  });

  return event;
}
