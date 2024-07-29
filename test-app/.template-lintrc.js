'use strict';

module.exports = {
  extends: 'recommended',
  overrides: [
    {
      files: ['tests/**/*'],
      rules: {
        // These probably don't need to be enabled for tests
        'no-action': 'off',
        'no-curly-component-invocation': 'off',
        'no-empty-headings': 'off',
        'no-inline-styles': 'off',
        'no-link-to-positional-params': 'off',
        'no-unnecessary-component-helper': 'off',
        'require-button-type': 'off',
        'require-input-label': 'off',
      },
    },
  ],
};
