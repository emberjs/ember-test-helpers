module.exports = {
  root: true,
  extends: ['eslint:recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['prettier', '@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
  },
  env: {
    browser: true,
  },
  rules: {
    'prettier/prettier': 'error',
  },
  overrides: [
    {
      files: ['**/*.ts'],
      extends: ['plugin:@typescript-eslint/eslint-recommended'],
      rules: {
        'no-unused-vars': 'off',
        'prefer-const': 'off',
      },
    },
    {
      files: [
        '.eslintrc.js',
        '.prettierrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'index.js',
        'testem.js',
        'scripts/**',
        'blueprints/*/index.js',
        'config/*.js',
        'tests/dummy/config/*.js',
      ],
      excludedFiles: ['addon-test-support/**'],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      extends: ['plugin:node/recommended'],
    },
    {
      files: ['tests/**/*-test.[jt]s', 'tests/helpers/*.js'],
      env: {
        qunit: true,
      },
    },
    {
      files: ['addon-test-support/**/*.[jt]s'],
      plugins: ['disable-features'],
    },
    {
      files: ['addon-test-support/**/*.[jt]s'],
      excludedFiles: ['addon-test-support/ember-test-helpers/legacy-0-6-x/**'],
      rules: {
        'valid-jsdoc': [
          'error',
          {
            prefer: {
              method: 'do-not-use-redundant-method-tag',
            },
            preferType: {
              String: 'string',
            },
            requireReturn: false,
          },
        ],
        'require-jsdoc': 'error',
      },
    },
    {
      files: [
        'addon-test-support/@ember/test-helpers/-internal/promise-polyfill.js',
      ],
      rules: {
        'require-jsdoc': 'off',
        'valid-jsdoc': 'off',
      },
    },
  ],
};
