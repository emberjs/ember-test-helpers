module.exports = {
  root: true,
  extends: ['eslint:recommended', 'prettier'],
  parser: 'typescript-eslint-parser',
  plugins: [
    'prettier',
    'typescript',
  ],
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
  },
  env: {
    browser: true,
  },
  rules: {
    'prettier/prettier': ['error', {
      singleQuote: true,
      trailingComma: 'es5',
      printWidth: 100,
    }],
  },
  overrides: [
    {
      files: ['index.js', 'config/ember-try.js', 'scripts/**'],
      excludedFiles: ['addon-test-support/**', 'tests/**'],
      parserOptions: {
        ecmaVersion: 2015,
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
        es6: true
      },
      plugins: ['node'],
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        // add your custom rules and overrides for node files here
      }),
    },
    {
      files: ['tests/**/*.[jt]s'],
      env: {
        qunit: true
      }
    },
    {
      files: ['index.js', 'addon-test-support/**/*.[jt]s', 'config/**/*.js'],
      plugins: [
        'disable-features',
      ],
      rules: {
        'disable-features/disable-async-await': 'error',
        'disable-features/disable-generator-functions': 'error',
      }
    },
    {
      files: ['addon-test-support/**/*.[jt]s'],
      excludedFiles: ['addon-test-support/ember-test-helpers/legacy-0-6-x/**'],
      rules: {
        'valid-jsdoc': ['error', {
          prefer: {
            'method': 'do-not-use-redundant-method-tag',
          },
          preferType: {
            'String': 'string',
          },
          requireReturn: false,
        }],
        'require-jsdoc': 'error',
      }
    },
  ]
};
