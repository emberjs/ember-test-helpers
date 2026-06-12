import '@ember/application';
import { getResolver, setResolver } from './resolver.js';

let __application__;

/**
  Stores the provided application instance so that tests being ran will be aware of the application under test.

  - Required by `setupApplicationContext` method.
  - Used by `setupContext` and `setupRenderingContext` when present.

  @public
  @param {Ember.Application} application the application that will be tested
*/
function setApplication(application) {
  __application__ = application;
  if (!getResolver()) {
    const Resolver = application.Resolver;
    const resolver = Resolver.create({
      namespace: application
    });
    setResolver(resolver);
  }
}

/**
  Retrieve the application instance stored by `setApplication`.

  @public
  @returns {Ember.Application} the previously stored application instance under test
*/
function getApplication() {
  return __application__;
}

export { getApplication, setApplication };
//# sourceMappingURL=application.js.map
