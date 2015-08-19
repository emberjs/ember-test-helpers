module.exports = {
  scenarios: [
    {
      name: 'ember-1.11.3',
      dependencies: {
        "ember": "1.11.3"
      },
      devDependencies: {
        "ember-data": "~1.0.0-beta.19.2"
      }
    },
    {
      name: 'ember-1.12.1',
      dependencies: {
        "ember": "1.12.1",
      },
      devDependencies: {
        "ember-data": "~1.0.0-beta.19.2"
      }
    },
    {
      name: 'ember-1.13.8',
      dependencies: {
        "ember": "1.13.8"
      }
    },
    {
      name: 'ember-2.0.0',
      dependencies: {
        "ember": "2.0.0"
      },
      devDependencies: {
        "ember-data": "~2.0.0-beta.2"
      }
    },
    {
      name: 'ember-release',
      dependencies: {
        "ember": "components/ember#release"
      },
      devDependencies: {
        "ember-data": "~2.0.0-beta.2"
      },
      resolutions: {
        "ember": "release"
      }
    },
    {
      name: 'ember-beta',
      dependencies: {
        "ember": "components/ember#beta"
      },
      devDependencies: {
        "ember-data": "~2.0.0-beta.2"
      },
      resolutions: {
        "ember": "beta"
      }
    },
    {
      name: 'ember-canary',
      dependencies: {
        "ember": "components/ember#canary"
      },
      devDependencies: {
        "ember-data": "~2.0.0-beta.2"
      },
      resolutions: {
        "ember": "canary"
      }
    }
  ]
};
