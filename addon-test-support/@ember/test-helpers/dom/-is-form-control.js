const FORM_CONTROL_TAGS = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'];

export default function isFormControl(el) {
  let { tagName, type } = el;

  if (type === 'hidden') {
    return false;
  }

  return FORM_CONTROL_TAGS.indexOf(tagName) > -1;
}
