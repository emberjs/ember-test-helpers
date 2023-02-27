import { getWindowOrElement } from './-get-window-or-element';
import fireEvent, {
  FileSelectionEventOptions,
  FileSelectionEventType,
  HTMLFileInputElement,
} from './fire-event';
import settled from '../settled';
import Target from './-target';
import { log } from '@ember/test-helpers/dom/-logging';
import isFormControl from './-is-form-control';
import { runHooks, registerHook } from '../-internal/helper-hooks';
import { FilterKeysByType } from '@ember/test-helpers/-filter-keys-by-type';

registerHook('triggerEvent', 'start', (target: Target, eventType: string) => {
  log('triggerEvent', target, eventType);
});

// Global Event overloads
export default function triggerEvent(
  target: string | Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, Event>,
  options?: EventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, AnimationEvent>,
  options?: AnimationEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, FocusEvent>,
  options?: FocusEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, CompositionEvent>,
  options?: CompositionEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, DragEvent>,
  options?: DragEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, ErrorEvent>,
  options?: ErrorEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, FocusEvent>,
  options?: FocusEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, FormDataEvent>,
  options?: FormDataEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, InputEvent>,
  options?: InputEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, KeyboardEvent>,
  options?: KeyboardEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, MouseEvent>,
  options?: MouseEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, PointerEvent>,
  options?: PointerEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, ProgressEvent>,
  options?: ProgressEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Element | Document | Window,
  eventType: FilterKeysByType<
    GlobalEventHandlersEventMap,
    SecurityPolicyViolationEvent
  >,
  options?: SecurityPolicyViolationEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, SubmitEvent>,
  options?: SubmitEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, TouchEvent>,
  options?: TouchEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, TransitionEvent>,
  options?: TransitionEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, UIEvent>,
  options?: UIEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Element | Document | Window,
  eventType: FilterKeysByType<GlobalEventHandlersEventMap, WheelEvent>,
  options?: WheelEventInit
): Promise<void>;

// Window Event overloads
export default function triggerEvent(
  target: string | Window,
  eventType: FilterKeysByType<WindowEventHandlersEventMap, Event>,
  options?: EventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Window,
  eventType: FilterKeysByType<WindowEventHandlersEventMap, BeforeUnloadEvent>
): Promise<void>;
export default function triggerEvent(
  target: string | Window,
  eventType: FilterKeysByType<WindowEventHandlersEventMap, GamepadEvent>,
  options?: GamepadEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Window,
  eventType: FilterKeysByType<WindowEventHandlersEventMap, HashChangeEvent>,
  options?: HashChangeEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Window,
  eventType: FilterKeysByType<WindowEventHandlersEventMap, MessageEvent>,
  options?: MessageEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Window,
  eventType: FilterKeysByType<WindowEventHandlersEventMap, PageTransitionEvent>,
  options?: PageTransitionEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Window,
  eventType: FilterKeysByType<WindowEventHandlersEventMap, PopStateEvent>,
  options?: PopStateEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Window,
  eventType: FilterKeysByType<
    WindowEventHandlersEventMap,
    PromiseRejectionEvent
  >,
  options?: PromiseRejectionEventInit
): Promise<void>;
export default function triggerEvent(
  target: string | Window,
  eventType: FilterKeysByType<WindowEventHandlersEventMap, StorageEvent>,
  options?: StorageEventInit
): Promise<void>;

// Document or Element overloads
export default function triggerEvent(
  target: string | Element | Document,
  eventType: FilterKeysByType<
    DocumentAndElementEventHandlersEventMap,
    ClipboardEvent
  >,
  options?: ClipboardEventInit
): Promise<void>;

// Document event overloads
export default function triggerEvent(
  target: string | Document,
  eventType: FilterKeysByType<DocumentEventMap, Event>,
  options?: EventInit
): Promise<void>;

// Element event overloads
export default function triggerEvent(
  target: string | Element,
  eventType: FilterKeysByType<ElementEventMap, Event>,
  options?: EventInit
): Promise<void>;

// Special casing for File Input change events
export default function triggerEvent(
  target: string | HTMLFileInputElement,
  eventType: FileSelectionEventType,
  options?: FileSelectionEventOptions
): Promise<void>;

// Custom event overloads
export default function triggerEvent(
  target: string | Element | Document | Window,
  eventType: string,
  options?: CustomEventInit<unknown>
): Promise<void>;

/**
 * Triggers an event on the specified target.
 *
 * @public
 * @param {Target} target the element or selector to trigger the event on
 * @param {string} eventType the type of event to trigger
 * @param {Object} options additional properties to be set on the event
 * @return {Promise<void>} resolves when the application is settled
 *
 * @example
 * <caption>
 * Using `triggerEvent` to upload a file
 *
 * When using `triggerEvent` to upload a file the `eventType` must be `change` and you must pass the
 * `options` param as an object with a key `files` containing an array of
 * [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob).
 * </caption>
 *
 * triggerEvent(
 *   'input.fileUpload',
 *   'change',
 *   { files: [new Blob(['Ember Rules!'])] }
 * );
 *
 *
 * @example
 * <caption>
 * Using `triggerEvent` to upload a dropped file
 *
 * When using `triggerEvent` to handle a dropped (via drag-and-drop) file, the `eventType` must be `drop`. Assuming your `drop` event handler uses the [DataTransfer API](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer),
 * you must pass the `options` param as an object with a key of `dataTransfer`. The `options.dataTransfer`     object should have a `files` key, containing an array of [File](https://developer.mozilla.org/en-US/docs/Web/API/File).
 * </caption>
 *
 * triggerEvent(
 *   '[data-test-drop-zone]',
 *   'drop',
 *   {
 *     dataTransfer: {
 *       files: [new File(['Ember Rules!'], 'ember-rules.txt')]
 *     }
 *   }
 * )
 */
export default function triggerEvent(
  target: Target,
  eventType: string,
  options?: EventInit
): Promise<void> {
  return Promise.resolve()
    .then(() => {
      return runHooks('triggerEvent', 'start', target, eventType, options);
    })
    .then(() => {
      if (!target) {
        throw new Error('Must pass an element or selector to `triggerEvent`.');
      }

      if (!eventType) {
        throw new Error(`Must provide an \`eventType\` to \`triggerEvent\``);
      }

      let element = getWindowOrElement(target);
      if (!element) {
        throw new Error(
          `Element not found when calling \`triggerEvent('${target}', ...)\`.`
        );
      }

      if (isFormControl(element) && element.disabled) {
        throw new Error(`Can not \`triggerEvent\` on disabled ${element}`);
      }

      return fireEvent(element, eventType, options).then(settled);
    })
    .then(() => {
      return runHooks('triggerEvent', 'end', target, eventType, options);
    });
}
