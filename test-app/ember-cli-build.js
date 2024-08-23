'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    // Add options here
  });

  const { maybeEmbroider } = require('@embroider/test-setup');
  return maybeEmbroider(app, {
    packageRules: [
      {
        package: 'test-app',
        components: {
          /**
           * All of these were found by searching for 'component:
           * and all of those happen to be in-app registrations
           *
           * It very well could be that we don't actually need to interact
           * with the resolver or registry anymore, but that investigation
           * has been left for a future date.
           */
          '{{x-test-1}}': { safeToIgnore: true },
          '{{x-test-2}}': { safeToIgnore: true },
          '{{x-test-3}}': { safeToIgnore: true },
          '{{x-test-4}}': { safeToIgnore: true },
          '{{x-test-5}}': { safeToIgnore: true },
          '{{x-foo}}': { safeToIgnore: true },
          '{{x-input}}': { safeToIgnore: true },
          '{{foo}}': { safeToIgnore: true },
          '{{foo-bar}}': { safeToIgnore: true },
          '{{my-input}}': { safeToIgnore: true },
          '{{my-component}}': { safeToIgnore: true },
          '{{click-me-button}}': { safeToIgnore: true },
          '{{promise-wrapper}}': { safeToIgnore: true },
          '{{js-only}}': { safeToIgnore: true },
          '{{outer-comp}}': { safeToIgnore: true },
          '{{inner-comp}}': { safeToIgnore: true },
          '{{template-only}}': { safeToIgnore: true },
        },
      },
    ],
  });
};
