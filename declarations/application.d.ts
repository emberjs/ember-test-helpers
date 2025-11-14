import Application from '@ember/application';
/**
  Stores the provided application instance so that tests being ran will be aware of the application under test.

  - Required by `setupApplicationContext` method.
  - Used by `setupContext` and `setupRenderingContext` when present.

  @public
  @param {Ember.Application} application the application that will be tested
*/
export declare function setApplication(application: Application): void;
/**
  Retrieve the application instance stored by `setApplication`.

  @public
  @returns {Ember.Application} the previously stored application instance under test
*/
export declare function getApplication(): Application | undefined;
//# sourceMappingURL=application.d.ts.map