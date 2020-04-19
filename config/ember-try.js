'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = function () {
  return Promise.all([
    getChannelURL('release'),
    getChannelURL('beta'),
    getChannelURL('canary'),
  ]).then(urls => {
    let envWithoutJQuery = {
      EMBER_OPTIONAL_FEATURES: JSON.stringify({ 'jquery-integration': false }),
    };

    return {
      useYarn: true,
      scenarios: [
        {
          name: 'ember-2.0',
          bower: {
            dependencies: {
              ember: '~2.0.0',
            },
          },
          npm: {
            devDependencies: {
              'ember-source': null,
              'ember-fetch': null,
              'ember-data': '~3.1.0',
            },
            dependencies: {
              'ember-cli-htmlbars-inline-precompile': '^1.0.5',
            },
          },
        },
        {
          name: 'ember-lts-2.4',
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
            dependencies: {
              'ember-cli-htmlbars-inline-precompile': '^1.0.5',
            },
          },
        },
        {
          name: 'ember-lts-2.8',
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
            dependencies: {
              'ember-cli-htmlbars-inline-precompile': '^1.0.5',
            },
          },
        },
        {
          name: 'ember-lts-2.12',
          npm: {
            devDependencies: {
              '@ember/jquery': '^0.6.0',
              'ember-source': '~2.12.0',
              'ember-fetch': null,
            },
          },
        },
        {
          name: 'ember-lts-2.16',
          env: envWithoutJQuery,
          npm: {
            devDependencies: {
              'ember-source': '~2.16.0',
              'ember-native-dom-event-dispatcher': '^0.6.4',
            },
          },
        },
        {
          name: 'ember-2.18',
          env: envWithoutJQuery,
          npm: {
            devDependencies: {
              'ember-source': '~2.18.0',
              'ember-native-dom-event-dispatcher': '^0.6.4',
            },
          },
        },
        {
          name: 'ember-lts-3.4',
          env: envWithoutJQuery,
          npm: {
            devDependencies: {
              'ember-source': '~3.4.0',
            },
          },
        },
        {
          name: 'ember-lts-3.8',
          env: envWithoutJQuery,
          npm: {
            devDependencies: {
              'ember-source': '~3.4.0',
            },
          },
        },
        {
          name: 'ember-lts-3.12',
          env: envWithoutJQuery,
          npm: {
            devDependencies: {
              'ember-source': '~3.4.0',
            },
          },
        },
        {
          name: 'ember-lts-3.16',
          env: envWithoutJQuery,
          npm: {
            devDependencies: {
              'ember-source': '~3.4.0',
            },
          },
        },
        {
          name: 'ember-release',
          env: envWithoutJQuery,
          npm: {
            devDependencies: {
              'ember-source': urls[0],
            },
          },
        },
        {
          name: 'ember-beta',
          env: envWithoutJQuery,
          npm: {
            devDependencies: {
              'ember-source': urls[1],
            },
          },
        },
        {
          name: 'ember-canary',
          env: envWithoutJQuery,
          npm: {
            devDependencies: {
              'ember-source': urls[2],
            },
          },
        },
        {
          name: 'ember-without-application-wrapper',
          env: {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({
              'application-template-wrapper': false,
              'jquery-integration': false,
            }),
          },
          npm: {
            devDependencies: {
              'ember-source': urls[2],
            },
          },
        },
        {
          name: 'ember-default-with-jquery',
          env: {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({ 'jquery-integration': true }),
          },
          npm: {
            devDependencies: {
              '@ember/jquery': '^0.6.0',
              'ember-fetch': null,
            },
          },
        },
        {
          name: 'ember-default',
          env: envWithoutJQuery,
          npm: {
            devDependencies: {},
          },
        },
      ],
    };
  });
};
