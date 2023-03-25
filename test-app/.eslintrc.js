'use strict';

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  plugins: ['ember', '@typescript-eslint'],
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
    // ts files
    {
      files: ['**/*.ts'],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {},
    },
    // node files
    {
      files: [
        './.eslintrc.js',
        './.prettierrc.js',
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
      plugins: ['node'],
      extends: ['plugin:node/recommended'],
      rules: {
        // this can be removed once the following is fixed
        // https://github.com/mysticatea/eslint-plugin-node/issues/77
        'node/no-unpublished-require': 'off',
      },
    },
    {
      // test files
      files: [
        'tests/**/*-test.{js,ts}',
        'tests/test-helper.{js,ts}',
        'tests/helpers/**/*.{js,ts}',
      ],
      extends: ['plugin:qunit/recommended'],
      rules: {
        // TODO: resolve these in a followup PR
        'no-undef': 'off',
        'ember/no-jquery': 'off',
        'ember/no-global-jquery': 'off',
        'ember/require-valid-css-selector-in-test-helpers': 'off',
        'ember/require-super-in-lifecycle-hooks': 'off',
        'ember/no-settled-after-test-helper': 'off',
        'qunit/no-negated-ok': 'off',
        'qunit/resolve-async': 'off',
        'ember/no-pause-test': 'off',
        'ember/new-module-imports': 'off',
        'ember/no-legacy-test-waiters': 'off',
        'ember/no-ember-testing-in-module-scope': 'off',
        'qunit/no-identical-names': 'off',
        'qunit/require-expect': 'off',
        'ember/no-actions-hash': 'off',
        'ember/no-get': 'off',
        'qunit/no-conditional-assertions': 'off',
        'qunit/no-early-return': 'off',
        'ember/no-classic-classes': 'off',
        'ember/no-classic-components': 'off',
        'qunit/no-assert-equal': 'off',
        'qunit/no-assert-equal-boolean': 'off',
        'ember/no-empty-glimmer-component-classes': 'off',
        'ember/avoid-leaking-state-in-ember-objects': 'off',
      },
    },
  ],
};
