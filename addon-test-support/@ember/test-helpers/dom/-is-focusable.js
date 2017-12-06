const FOCUSABLE_TAGS = ['INPUT', 'BUTTON', 'LINK', 'SELECT', 'A', 'TEXTAREA'];
export default function isFocusable(el) {
  let { tagName, type } = el;

  if (type === 'hidden') {
    return false;
  }

  if (FOCUSABLE_TAGS.indexOf(tagName) > -1 || el.contentEditable === 'true') {
    return true;
  }

  return el.hasAttribute('tabindex');
}
