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
      files: [
        '.eslintrc.js',
        '.prettierrc.js',
        '.template-lintrc.js',
        'index.js',
        'config/ember-try.js',
        'config/environment.js',
        'testem.js',
        'scripts/**',
      ],
      excludedFiles: ['addon-test-support/**', 'tests/**'],
      parserOptions: {
        ecmaVersion: 2017,
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
        es6: true,
      },
      plugins: ['node'],
      extends: ['plugin:node/recommended'],
    },
    {
      files: ['tests/**/*.[jt]s'],
      env: {
        qunit: true,
      },
    },
    {
      files: ['**/*.ts'],
      extends: ['plugin:@typescript-eslint/eslint-recommended'],
      rules: {
        'no-unused-vars': 'off',
        'prefer-const': 'off',
      },
    },
    {
      files: ['addon-test-support/**/*.[jt]s'],
      plugins: ['disable-features'],
      rules: {
        'disable-features/disable-async-await': 'error',
        'disable-features/disable-generator-functions': 'error',
      },
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
