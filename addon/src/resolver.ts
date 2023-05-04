import type { Resolver } from '@ember/owner';

let __resolver__: Resolver | undefined;

/**
  Stores the provided resolver instance so that tests being ran can resolve
  objects in the same way as a normal application.

  Used by `setupContext` and `setupRenderingContext` as a fallback when `setApplication` was _not_ used.

  @public
  @param {Ember.Resolver} resolver the resolver to be used for testing
*/
export function setResolver(resolver: Resolver): void {
  __resolver__ = resolver;
}

/**
  Retrieve the resolver instance stored by `setResolver`.

  @public
  @returns {Ember.Resolver} the previously stored resolver
*/
export function getResolver(): Resolver | undefined {
  return __resolver__;
}
