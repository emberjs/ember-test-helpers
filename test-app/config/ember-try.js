'use strict';

const getChannelURL = require('ember-source-channel-url');
const latestVersion = require('latest-version');

module.exports = async function () {
  const EMBROIDER_VERSION = await latestVersion('@embroider/core');

  const embroider = {
    safe: {
      name: 'embroider-safe',
      npm: {
        devDependencies: {
          '@embroider/core': EMBROIDER_VERSION,
          '@embroider/webpack': EMBROIDER_VERSION,
          '@embroider/compat': EMBROIDER_VERSION,
          '@embroider/test-setup': EMBROIDER_VERSION,
        },
      },
      env: {
        EMBROIDER_TEST_SETUP_OPTIONS: 'safe',
      },
    },

    optimized: {
      name: 'embroider-optimized',
      npm: {
        devDependencies: {
          '@embroider/core': EMBROIDER_VERSION,
          '@embroider/webpack': EMBROIDER_VERSION,
          '@embroider/compat': EMBROIDER_VERSION,
          '@embroider/test-setup': EMBROIDER_VERSION,
        },
      },
      env: {
        EMBROIDER_TEST_SETUP_OPTIONS: 'optimized',
      },
    },
  };

  return {
    useYarn: true,
    scenarios: [
      {
        name: 'ember-lts-4.4',
        npm: {
          devDependencies: {
            'ember-source': '~4.4.0',
          },
        },
      },
      {
        name: 'ember-lts-4.8',
        npm: {
          devDependencies: {
            'ember-source': '~4.8.0',
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta'),
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('canary'),
            'ember-resolver': '10.0.0',
            '@ember/string': '3.0.1',
          },
        },
      },
      {
        name: 'ember-default',
        npm: {
          devDependencies: {},
        },
      },
      embroider.safe,
      // disable embroider optimized test scenarios, as the dynamism these
      // tests use is not compatible with embroider we are still exploring
      // appropriate paths forward.
      //
      // Steps to re-enable:
      //
      // 1. have a strategy to make this work
      // 2. uncomment the next line
      // embroider.optimized,
      //
      // 3. add "embroider-optimized" to .github/workflows/ci-build.yml's
      //    ember-try-scenario list.
      //
    ],
  };
};
