var __resolver__;

export function setResolver(resolver) {
  __resolver__ = resolver;
}

export function getResolver() {
  if (__resolver__ == null) {
    throw new Error('you must set a resolver with `testResolver.set(resolver)`');
  }

  return __resolver__;
}
