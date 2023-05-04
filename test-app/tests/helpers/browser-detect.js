export const isEdge = navigator.userAgent.indexOf('Edge') >= 0;

// Unlike Chrome, Firefox emits `selectionchange` events.
export const isFirefox = navigator.userAgent.indexOf('Firefox') >= 0;
