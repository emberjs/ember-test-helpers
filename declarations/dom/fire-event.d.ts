export declare const KEYBOARD_EVENT_TYPES: ["keydown", "keypress", "keyup"];
export type KeyboardEventType = (typeof KEYBOARD_EVENT_TYPES)[number];
export declare function isKeyboardEventType(eventType: any): eventType is KeyboardEventType;
declare const MOUSE_EVENT_TYPES: ["click", "mousedown", "mouseup", "dblclick", "mouseenter", "mouseleave", "mousemove", "mouseout", "mouseover"];
export type MouseEventType = (typeof MOUSE_EVENT_TYPES)[number];
export declare function isMouseEventType(eventType: any): eventType is MouseEventType;
declare const FILE_SELECTION_EVENT_TYPES: ["change"];
export type FileSelectionEventType = (typeof FILE_SELECTION_EVENT_TYPES)[number];
export declare function isFileSelectionEventType(eventType: any): eventType is FileSelectionEventType;
export declare function isFileSelectionInput(element: any): element is HTMLInputElement;
declare function fireEvent(element: Element | Document | Window, eventType: KeyboardEventType, options?: any): Promise<Event>;
declare function fireEvent(element: Element | Document | Window, eventType: MouseEventType, options?: any): Promise<Event | void>;
declare function fireEvent(element: Element | Document | Window, eventType: string, options?: any): Promise<Event>;
export default fireEvent;
export declare function _buildKeyboardEvent(type: KeyboardEventType, options?: any): Event;
//# sourceMappingURL=fire-event.d.ts.map