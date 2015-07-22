var __test_context__;

export function setContext(context) {
  __test_context__ = context;
}

export function getContext() {
  return __test_context__;
}

export function unsetContext() {
  __test_context__ = undefined;
}
