import Application from '@ember/application';
import type { Resolver } from '@ember/owner';
import type EmberOwner from '@ember/owner';
import type { SimpleElement } from '@simple-dom/interface';
export interface Owner extends EmberOwner {
    rootElement?: string | Element | SimpleElement | null;
    _lookupFactory?(key: string): any;
    visit(url: string, options?: {
        [key: string]: any;
    }): Promise<any>;
}
/**
  Creates an "owner" (an `Ember.ApplicationInstance`) from the provided
  options.

  If `options.application` is present (e.g. setup by an earlier call to
  `setApplication`) an `Ember.ApplicationInstance` is built via
  `application.buildInstance()`.

  If `options.application` is not present, we fall back to using
  `options.resolver` instead (setup via `setResolver`). This creates an
  `Ember.Application` that has only the resolver, and builds the
  `Ember.ApplicationInstance` from it. The application is destroyed together
  with the instance.

  @private
  @param {Ember.Application} [application] the Ember.Application to build an instance from
  @param {Ember.Resolver} [resolver] the resolver to build an application from
  @returns {Promise<Ember.ApplicationInstance>} a promise resolving to the generated "owner"
*/
export default function buildOwner(application: Application | undefined | null, resolver: Resolver | undefined | null): Promise<Owner>;
//# sourceMappingURL=build-owner.d.ts.map