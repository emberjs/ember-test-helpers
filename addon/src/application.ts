import Application from '@ember/application';

import { getResolver, setResolver } from './resolver.ts';

let __application__: Application | undefined;

/**
  Stores the provided application instance so that tests being ran will be aware of the application under test.

  - Required by `setupApplicationContext` method.
  - Used by `setupContext` and `setupRenderingContext` when present.

  @public
  @param {Ember.Application} application the application that will be tested
*/
export function setApplication(application: Application): void {
  __application__ = application;

  if (!getResolver()) {
    const Resolver = (application as any).Resolver;
    const resolver = Resolver.create({ namespace: application });

    setResolver(resolver);
  }
}

/**
  Retrieve the application instance stored by `setApplication`.

  @public
  @returns {Ember.Application} the previously stored application instance under test
*/
export function getApplication(): Application | undefined {
  return __application__;
}
