// `window.ActiveXObject` returns undefined in IE11 (as well as non-IE browsers)
// `"ActiveXObject" in window` returns `true` in all IE versions
// only IE11 will pass _both_ of these conditions
export const isIE11 = !window.ActiveXObject && 'ActiveXObject' in window;
export const isIE = 'ActiveXObject' in window;

export const isEdge = navigator.userAgent.indexOf('Edge') >= 0;
