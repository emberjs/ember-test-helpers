let __resolver__;

/**
  Stores the provided resolver instance so that tests being ran can resolve
  objects in the same way as a normal application.

  Used by `setupContext` and `setupRenderingContext` as a fallback when `setApplication` was _not_ used.

  @public
  @param {Ember.Resolver} resolver the resolver to be used for testing
*/
function setResolver(resolver) {
  __resolver__ = resolver;
}

/**
  Retrieve the resolver instance stored by `setResolver`.

  @public
  @returns {Ember.Resolver} the previously stored resolver
*/
function getResolver() {
  return __resolver__;
}

export { getResolver, setResolver };
//# sourceMappingURL=resolver.js.map
