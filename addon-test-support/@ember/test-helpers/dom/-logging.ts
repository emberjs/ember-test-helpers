/**
 * This generates a human-readable description to a DOM element.
 *
 * @private
 * @param {*} el The element that should be described
 * @returns {string} A human-readable description
 */
export function elementToString(el: unknown) {
  let desc: string;
  if (el instanceof NodeList) {
    if (el.length === 0) {
      return 'empty NodeList';
    }
    desc = Array.prototype.slice
      .call(el, 0, 5)
      .map(elementToString)
      .join(', ');
    return el.length > 5 ? `${desc}... (+${el.length - 5} more)` : desc;
  }
  if (!(el instanceof HTMLElement || el instanceof SVGElement)) {
    return String(el);
  }

  desc = el.tagName.toLowerCase();
  if (el.id) {
    desc += `#${el.id}`;
  }
  if (el.className && !(el.className instanceof SVGAnimatedString)) {
    desc += `.${String(el.className).replace(/\s+/g, '.')}`;
  }
  Array.prototype.forEach.call(el.attributes, function(attr: Attr) {
    if (attr.name !== 'class' && attr.name !== 'id') {
      desc += `[${attr.name}${attr.value ? `="${attr.value}"]` : ']'}`;
    }
  });
  return desc;
}
