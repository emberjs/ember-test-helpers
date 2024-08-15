export const isEdge = navigator.userAgent.indexOf('Edge') >= 0;

// Firefox emits `selectionchange` events.
export const isFirefox = navigator.userAgent.indexOf('Firefox') >= 0;

// Chrome emits `selectionchange` events.
export const isChrome = navigator.userAgent.indexOf('Chrome') >= 0;
