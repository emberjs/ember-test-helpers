'use strict';

module.exports = {
  root: true,
  // Only use overrides
  // https://github.com/ember-cli/eslint-plugin-ember?tab=readme-ov-file#gtsgjs
  overrides: [
    {
      files: ['**/*.js', '**/*.ts'],
      env: { browser: true },
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
      },
      plugins: ['ember', 'import'],
      extends: [
        'eslint:recommended',
        'plugin:ember/recommended',
        'plugin:prettier/recommended',
      ],
      rules: {
        // require relative imports use full extensions
        'import/extensions': ['error', 'always', { ignorePackages: true }],
        // Add any custom rules here
      },
    },
    // ts files
    {
      files: ['**/*.ts'],
      extends: [
        'eslint:recommended',
        'plugin:ember/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
      ],
      rules: {
        // require relative imports use full extensions
        'import/extensions': ['error', 'always', { ignorePackages: true }],
        // We break a lot of rules with types
        // (public types do not always exist for the things we need to import)
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-types': 'off',
        // We access the _routerMicrolib
        // and router:main
        'ember/no-private-routing-service': 'off',
        // This library must violate this rule so that consumers
        // can have some additional protections for working _with_ this rule.
        'ember/no-ember-testing-in-module-scope': 'off',
        // Used in `setupRenderingContext` to hook in to "appendTo"
        // on the -top-level-view:main
        'ember/no-runloop': 'off',
        // For accessing container_proxy and registry_proxy
        'ember/no-mixins': 'off',
        // We violate this for making the owner in build-registry.
        'ember/no-classic-classes': 'off',
      },
    },
    {
      files: ['**/*.gts'],
      parser: 'ember-eslint-parser',
      plugins: ['ember', 'import'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:ember/recommended',
        'plugin:ember/recommended-gts',
        'plugin:prettier/recommended',
      ],
      rules: {
        // require relative imports use full extensions
        'import/extensions': ['error', 'always', { ignorePackages: true }],
        // Add any custom rules here
      },
    },
    {
      files: ['**/*.gjs'],
      parser: 'ember-eslint-parser',
      plugins: ['ember', 'import'],
      extends: [
        'eslint:recommended',
        'plugin:ember/recommended',
        'plugin:ember/recommended-gjs',
        'plugin:prettier/recommended',
      ],
      rules: {
        // require relative imports use full extensions
        'import/extensions': ['error', 'always', { ignorePackages: true }],
        // Add any custom rules here
      },
    },
    // node files
    {
      files: [
        './.eslintrc.cjs',
        './.prettierrc.cjs',
        './.template-lintrc.cjs',
        './addon-main.cjs',
      ],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
      plugins: ['n'],
      extends: [
        'eslint:recommended',
        'plugin:n/recommended',
        'plugin:prettier/recommended',
      ],
    },
  ],
};
