'use strict';

module.exports = {
  extends: 'recommended',

  overrides: [
    {
      // TODO: resolve these in a followup PR
      files: ['**/*.{js,ts}'],
      rules: {
        'no-empty-headings': 'off',
        'no-inline-styles': 'off',
        'no-curly-component-invocation': 'off',
        'require-input-label': 'off',
        'require-button-type': 'off',
        'no-link-to-positional-params': 'off',
        'no-unnecessary-component-helper': 'off',
        'no-action': 'off',
      },
    },
  ],
};
