module.exports = {
  scenarios: [
    {
      name: 'ember-1.10',
      dependencies: {
        "ember": "~1.10.0"
      },
      devDependencies: {
        "ember-data": "~1.0.0-beta.19.2"
      }
    },
    {
      name: 'ember-1.11',
      dependencies: {
        "ember": "~1.11.3"
      },
      devDependencies: {
        "ember-data": "~1.0.0-beta.19.2"
      }
    },
    {
      name: 'ember-1.12',
      dependencies: {
        "ember": "~1.12.1"
      },
      devDependencies: {
        "ember-data": "~1.0.0-beta.19.2"
      }
    },
    {
      name: 'ember-1.13',
      dependencies: {
        "ember": "~1.13.8"
      },
      devDependencies: {
        "ember-data": "~1.0.0-beta.19.2"
      }
    },
    {
      name: 'ember-2.0',
      dependencies: {
        "ember": "~2.0.0"
      },
      devDependencies: {
        "ember-data": "~2.0.0"
      }
    },
    {
      name: 'ember-2.1',
      dependencies: {
        "ember": "~2.1.0"
      },
      devDependencies: {
        "ember-data": "~2.1.0"
      }
    },
    {
      name: 'ember-2.2',
      dependencies: {
        "ember": "~2.2.0"
      },
      devDependencies: {
        "ember-data": "~2.2.0"
      }
    },
    {
      name: 'ember-2.3',
      dependencies: {
        "ember": "~2.3.0"
      },
      devDependencies: {
        "ember-data": "~2.3.0"
      }
    },
    {
      name: 'ember-2.4',
      bower: {
        dependencies: {
          "ember": "~2.4.0"
        },
        devDependencies: {
          "ember-cli-shims": "ember-cli/ember-cli-shims#0.1.0"
        },
        resolutions: {
          "ember": "~2.4.0"
        }
      },
      npm: {
        devDependencies: {
          "ember-data": "~2.4"
        }
      }
    },
    {
      name: 'ember-2.5',
      bower: {
        dependencies: {
          "ember": "~2.5.0"
        },
        devDependencies: {
          "ember-cli-shims": "ember-cli/ember-cli-shims#0.1.0"
        },
        resolutions: {
          "ember": "~2.5.0"
        }
      },
      npm: {
        devDependencies: {
          "ember-data": "~2.5"
        }
      }
    },
    {
      name: 'ember-2.6',
      bower: {
        dependencies: {
          "ember": "~2.6.0-beta.1"
        },
        devDependencies: {
          "ember-cli-shims": "ember-cli/ember-cli-shims#0.1.0"
        },
        resolutions: {
          "ember": "~2.6.0-beta.1"
        }
      },
      npm: {
        devDependencies: {
          "ember-data": "^2.5.0"
        }
      }
    },
    {
      name: 'ember-release',
      bower: {
        dependencies: {
          "ember": "components/ember#release"
        },
        devDependencies: {
          "ember-cli-shims": "ember-cli/ember-cli-shims#0.1.0"
        },
        resolutions: {
          "ember": "release"
        }
      },
      npm: {
        devDependencies: {
          "ember-data": "^2.5.0"
        }
      }
    },
    {
      name: 'ember-beta',
      bower: {
        dependencies: {
          "ember": "components/ember#beta"
        },
        devDependencies: {
          "ember-cli-shims": "ember-cli/ember-cli-shims#0.1.0"
        },
        resolutions: {
          "ember": "beta"
        }
      },
      npm: {
        devDependencies: {
          "ember-data": "^2.5.0"
        }
      }
    },
    {
      name: 'ember-canary',
      bower: {
        dependencies: {
          "ember": "components/ember#canary"
        },
        devDependencies: {
          "ember-cli-shims": "ember-cli/ember-cli-shims#0.1.0"
        },
        resolutions: {
          "ember": "canary"
        }
      },
      npm: {
        devDependencies: {
          "ember-data": "^2.5.0"
        }
      }
    },
    {
      name: 'ember-data-2.3',
      bower: {
        dependencies: {
          "ember": "release"
        },
        devDependencies: {
          "ember-cli-shims": "ember-cli/ember-cli-shims#0.1.0"
        },
        resolutions: {
          "ember": "release"
        }
      },
      npm: {
        devDependencies: {
          "ember-data": "~2.3"
        }
      }
    }
  ]
};
