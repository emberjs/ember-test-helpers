'use strict';

module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      plugins: [
        ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }],
      ],
    },
  },
  plugins: ['ember'],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    browser: true,
  },
  rules: {},
  overrides: [
    // node files
    {
      files: [
        './.eslintrc.js',
        './.prettierrc.js',
        './.stylelintrc.js',
        './.template-lintrc.js',
        './ember-cli-build.js',
        './testem.js',
        './blueprints/*/index.js',
        './config/**/*.js',
        './lib/*/index.js',
        './server/**/*.js',
      ],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
      extends: ['plugin:n/recommended'],
    },
    {
      // test files
      files: ['tests/**/*'],
      extends: ['plugin:qunit/recommended'],
      rules: {
        // TODO items from upgrades (but also, test-helpers may need to support all these things)

        // eslint-plugin-ember
        'ember/avoid-leaking-state-in-ember-objects': 'off',
        'ember/new-module-imports': 'off',
        'ember/no-actions-hash': 'off',
        'ember/no-classic-classes': 'off',
        'ember/no-classic-components': 'off',
        'ember/no-ember-testing-in-module-scope': 'off',
        'ember/no-empty-glimmer-component-classes': 'off',
        'ember/no-get': 'off',
        'ember/require-super-in-lifecycle-hooks': 'off',
        'ember/no-global-jquery': 'off',
        'ember/no-jquery': 'off',
        'ember/no-legacy-test-waiters': 'off',
        'ember/no-pause-test': 'off',
        'ember/no-settled-after-test-helper': 'off',
        'ember/require-valid-css-selector-in-test-helpers': 'off',

        // eslint-plugin-qunit
        'qunit/no-assert-equal': 'off',
        'qunit/no-assert-equal-boolean': 'off',
        'qunit/no-conditional-assertions': 'off',
        'qunit/no-early-return': 'off',
        'qunit/no-identical-names': 'off',
        'qunit/no-negated-ok': 'off',
        'qunit/require-expect': 'off',
        'qunit/resolve-async': 'off',
      },
    },
  ],
};
