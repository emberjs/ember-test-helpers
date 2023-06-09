'use strict';

const getChannelURL = require('ember-source-channel-url');
const { embroiderSafe } = require('@embroider/test-setup');

module.exports = async function () {
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
        name: 'ember-lts-5.0',
        npm: {
          devDependencies: {
            'ember-source': '~5.0.0',
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
      embroiderSafe(),
      // disable embroider optimized test scenarios, as the dynamism these
      // tests use is not compatible with embroider we are still exploring
      // appropriate paths forward.
      //
      // Steps to re-enable:
      //
      // 1. have a strategy to make this work, import from '@embroider/test-setup'
      // 2. uncomment the next line
      // embroiderOptimized();
      //
      // 3. add "embroider-optimized" to .github/workflows/ci-build.yml's
      //    ember-try-scenario list.
      //
    ],
  };
};
