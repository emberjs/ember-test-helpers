'use strict';

const getChannelURL = require('ember-source-channel-url');
const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');
const latestVersion = require('latest-version');

module.exports = async function () {
  const atTypes = {
    '@types/ember': await latestVersion('@types/ember'),
    '@types/ember__application': await latestVersion(
      '@types/ember__application'
    ),
    '@types/ember__array': await latestVersion('@types/ember__array'),
    '@types/ember__component': await latestVersion('@types/ember__component'),
    '@types/ember__controller': await latestVersion('@types/ember__controller'),
    '@types/ember__debug': await latestVersion('@types/ember__debug'),
    '@types/ember__destroyable': await latestVersion(
      '@types/ember__destroyable'
    ),
    '@types/ember__engine': await latestVersion('@types/ember__engine'),
    '@types/ember__error': await latestVersion('@types/ember__error'),
    '@types/ember__helper': await latestVersion('@types/ember__helper'),
    '@types/ember__modifier': await latestVersion('@types/ember__modifier'),
    '@types/ember__object': await latestVersion('@types/ember__object'),
    '@types/ember__owner': await latestVersion('@types/ember__owner'),
    '@types/ember__polyfills': await latestVersion('@types/ember__polyfills'),
    '@types/ember__routing': await latestVersion('@types/ember__routing'),
    '@types/ember__runloop': await latestVersion('@types/ember__runloop'),
    '@types/ember__service': await latestVersion('@types/ember__service'),
    '@types/ember__string': await latestVersion('@types/ember__string'),
    '@types/ember__template': await latestVersion('@types/ember__template'),
    '@types/ember__test': await latestVersion('@types/ember__test'),
    '@types/ember__utils': await latestVersion('@types/ember__utils'),
  };

  return {
    usePnpm: true,
    scenarios: [
      {
        name: 'ember-lts-4.4',
        npm: {
          devDependencies: {
            '@glimmer/interfaces': '~0.84.3',
            '@glimmer/reference': '~0.84.3',
            'ember-source': '~4.4.0',
            ...atTypes,
          },
        },
      },
      {
        name: 'ember-lts-4.8', // preview types introduced
        npm: {
          devDependencies: {
            '@glimmer/interfaces': '~0.84.3',
            '@glimmer/reference': '~0.84.3',
            'ember-source': '~4.8.0',
          },
        },
      },
      {
        name: 'ember-lts-4.12', // preview types introduced
        npm: {
          devDependencies: {
            '@glimmer/interfaces': '~0.84.3',
            '@glimmer/reference': '~0.84.3',
            'ember-source': '~4.12.0',
          },
        },
      },
      {
        name: 'ember-lts-5.4',
        npm: {
          devDependencies: {
            '@glimmer/interfaces': '~0.84.3',
            '@glimmer/reference': '~0.84.3',
            'ember-source': '~5.4.0',
          },
        },
      },
      {
        name: 'ember-lts-5.8',
        npm: {
          devDependencies: {
            '@glimmer/interfaces': '~0.87.1',
            'ember-source': '~5.8.0',
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            '@glimmer/interfaces': '~0.92.0',
            'ember-source': await getChannelURL('release'),
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            '@glimmer/interfaces': '~0.92.0',
            'ember-source': await getChannelURL('beta'),
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            '@glimmer/interfaces': '~0.92.0',
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
      embroiderOptimized(),
      embroiderOptimized({
        name: '@ember/test-waiters@v4',
        npm: {
          devDependencies: {
            '@ember/test-waiters': '^4.0.0',
          },
        },
      }),
    ],
  };
};
