'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = function() {
  return Promise.all([
    getChannelURL('release'),
    getChannelURL('beta'),
    getChannelURL('canary'),
  ]).then(urls => {
    let env = {
      EMBER_OPTIONAL_FEATURES: JSON.stringify({ 'jquery-integration': false }),
    };

    return {
      useYarn: true,
      scenarios: [
        {
          name: 'ember-2.0',
          env,
          bower: {
            dependencies: {
              ember: '~2.0.0',
            },
          },
          npm: {
            devDependencies: {
              'ember-source': null,
              'ember-fetch': null,
            },
          },
        },
        {
          name: 'ember-lts-2.4',
          env,
          bower: {
            dependencies: {
              ember: 'components/ember#lts-2-4',
            },
            resolutions: {
              ember: 'lts-2-4',
            },
          },
          npm: {
            devDependencies: {
              'ember-source': null,
              'ember-fetch': null,
            },
          },
        },
        {
          name: 'ember-lts-2.8',
          env,
          bower: {
            dependencies: {
              ember: 'components/ember#lts-2-8',
            },
            resolutions: {
              ember: 'lts-2-8',
            },
          },
          npm: {
            devDependencies: {
              'ember-source': null,
              'ember-fetch': null,
            },
          },
        },
        {
          name: 'ember-lts-2.12',
          env,
          npm: {
            devDependencies: {
              'ember-source': '~2.12.0',
              'ember-fetch': null,
            },
          },
        },
        {
          name: 'ember-lts-2.16',
          env,
          npm: {
            devDependencies: {
              'ember-source': '~2.16.0-beta.1',
              'ember-native-dom-event-dispatcher': '^0.6.4',
            },
          },
        },
        {
          name: 'ember-release',
          env,
          npm: {
            devDependencies: {
              'ember-source': urls[0],
            },
          },
        },
        {
          name: 'ember-beta',
          env,
          npm: {
            devDependencies: {
              'ember-source': urls[1],
            },
          },
        },
        {
          name: 'ember-canary',
          env,
          npm: {
            devDependencies: {
              'ember-source': urls[2],
            },
          },
        },
        {
          name: 'ember-without-application-wrapper',
          env: Object.assign({}, env, {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({ 'application-template-wrapper': false }),
          }),
          npm: {
            devDependencies: {
              'ember-source': urls[2],
            },
          },
        },
        {
          name: 'ember-default-with-jquery',
          env: Object.assign({}, env, {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({ 'jquery-integration': true }),
          }),
          npm: {
            devDependencies: {
              'ember-fetch': null,
            },
          },
        },
        {
          name: 'ember-default',
          env,
          npm: {
            devDependencies: {},
          },
        },
      ],
    };
  });
};
