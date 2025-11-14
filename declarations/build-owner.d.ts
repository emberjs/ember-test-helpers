import Application from '@ember/application';
import type { Resolver } from '@ember/owner';
import type EmberOwner from '@ember/owner';
import type { SimpleElement } from '@simple-dom/interface';
export interface Owner extends EmberOwner {
    _emberTestHelpersMockOwner?: boolean;
    rootElement?: string | Element | SimpleElement | null;
    _lookupFactory?(key: string): any;
    visit(url: string, options?: {
        [key: string]: any;
    }): Promise<any>;
}
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
export default function buildOwner(application: Application | undefined | null, resolver: Resolver | undefined | null): Promise<Owner>;
//# sourceMappingURL=build-owner.d.ts.map