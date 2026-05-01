import '@ember/application';
import buildRegistry from './-internal/build-registry.js';

/**
  Creates an "owner" (an object that either _is_ or duck-types like an
  `Ember.ApplicationInstance`) from the provided options.

  If `options.application` is present (e.g. setup by an earlier call to
  `setApplication`) an `Ember.ApplicationInstance` is built via
  `application.buildInstance()`.

  If `options.application` is not present, we fall back to using
  `options.resolver` instead (setup via `setResolver`). This creates a mock
  "owner" by using a custom created combination of `Ember.Registry`,
  `Ember.Container`, `Ember._ContainerProxyMixin`, and
  `Ember._RegistryProxyMixin`.

  @private
  @param {Ember.Application} [application] the Ember.Application to build an instance from
  @param {Ember.Resolver} [resolver] the resolver to use to back a "mock owner"
  @returns {Promise<Ember.ApplicationInstance>} a promise resolving to the generated "owner"
*/
function buildOwner(application, resolver) {
  if (application) {
    // @ts-ignore: this type is correct and will check against Ember 4.12 or 5.1
    // or later. However, the first round of preview types in Ember 4.8 does not
    // include the `visit` API (it was missing for many years!) and therefore
    // there is no way to make this assignable accross all supported versions.
    return application.boot().then(app => app.buildInstance().boot());
  }
  if (!resolver) {
    throw new Error('You must set up the ember-test-helpers environment with either `setResolver` or `setApplication` before running any tests.');
  }
  const {
    owner
  } = buildRegistry(resolver);
  return Promise.resolve(owner);
}

export { buildOwner as default };
//# sourceMappingURL=build-owner.js.map
