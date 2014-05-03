function exists(selector) {
  return !!window.find(selector).length;
}

export {
  exists
}
