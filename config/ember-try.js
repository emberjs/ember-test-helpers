/* eslint-env node */

module.exports = {
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
          'ember-native-dom-event-dispatcher': null,
          'ember-fetch': null,
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
          'ember-native-dom-event-dispatcher': null,
          'ember-fetch': null,
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
          'ember-native-dom-event-dispatcher': null,
          'ember-fetch': null,
        },
      },
    },
    {
      name: 'ember-lts-2.12',
      npm: {
        devDependencies: {
          'ember-source': '~2.12.0',
          'ember-native-dom-event-dispatcher': null,
          'ember-fetch': null,
        },
      },
    },
    {
      name: 'ember-lts-2.16',
      npm: {
        devDependencies: {
          'ember-source': '~2.16.0-beta.1',
        },
      },
    },
    {
      name: 'ember-release',
      npm: {
        devDependencies: {
          'ember-source': 'http://builds.emberjs.com/release.tgz',
        },
      },
    },
    {
      name: 'ember-beta',
      npm: {
        devDependencies: {
          'ember-source': 'http://builds.emberjs.com/beta.tgz',
        },
      },
    },
    {
      name: 'ember-canary',
      npm: {
        devDependencies: {
          'ember-source': 'http://builds.emberjs.com/canary.tgz',
        },
      },
    },
    {
      name: 'ember-release-with-jquery',
      npm: {
        devDependencies: {
          'ember-native-dom-event-dispatcher': null,
          'ember-fetch': null,
        },
      },
    },
    {
      name: 'ember-default',
      npm: {
        devDependencies: {},
      },
    },
  ],
};
