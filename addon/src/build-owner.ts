import Application from '@ember/application';
import { registerDestructor } from '@ember/destroyable';
import type { Resolver } from '@ember/owner';

import type EmberOwner from '@ember/owner';
import type { SimpleElement } from '@simple-dom/interface';

export interface Owner extends EmberOwner {
  rootElement?: string | Element | SimpleElement | null;

  _lookupFactory?(key: string): any;

  // Note: this should be the same as `Application['visit']`, but that *type* is
  // only available from Ember 4.12 on. Once we require Ember >= 5.1 and rely on
  // the stable types, this will not be necessary and the related `@ts-ignore`
  // below can also be removed.
  visit(url: string, options?: { [key: string]: any }): Promise<any>;
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
export default function buildOwner(
  application: Application | undefined | null,
  resolver: Resolver | undefined | null,
): Promise<Owner> {
  if (application) {
    // @ts-ignore: this type is correct and will check against Ember 4.12 or 5.1
    // or later. However, the first round of preview types in Ember 4.8 does not
    // include the `visit` API (it was missing for many years!) and therefore
    // there is no way to make this assignable accross all supported versions.
    return application.boot().then((app) => app.buildInstance().boot());
  }

  if (!resolver) {
    throw new Error(
      'You must set up the ember-test-helpers environment with either `setResolver` or `setApplication` before running any tests.',
    );
  }

  const resolverOnlyApplication = Application.create({
    autoboot: false,
    rootElement: '#ember-testing',
    // @ts-ignore: this is actually the correcct type, but there was a typo in
    // Ember's docs for many years which meant that there was a matching problem
    // in the types for Ember's definition of `Engine`. Once we require at least
    // Ember 5.1 (in some future breaking change), this ts-ignore can be removed.
    Resolver: {
      create() {
        return resolver;
      },
    },
  });

  // @ts-ignore: see the note on `visit` above.
  return resolverOnlyApplication
    .boot()
    .then((app) => app.buildInstance().boot())
    .then((owner) => {
      registerDestructor(owner, () => resolverOnlyApplication.destroy());

      return owner;
    });
}
