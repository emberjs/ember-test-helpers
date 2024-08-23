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
          '{{x-test-1}}': { safeToIgnore: true },
          '{{x-test-2}}': { safeToIgnore: true },
          '{{x-test-3}}': { safeToIgnore: true },
          '{{x-test-4}}': { safeToIgnore: true },
          '{{x-test-5}}': { safeToIgnore: true },
          '{{foo-bar}}': { safeToIgnore: true },
          '{{x-foo}}': { safeToIgnore: true },
          '{{x-input}}': { safeToIgnore: true },
          '{{my-input}}': { safeToIgnore: true },
          '{{my-component}}': { safeToIgnore: true },
        },
      },
    ],
  });
};
