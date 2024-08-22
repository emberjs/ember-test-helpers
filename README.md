@ember/test-helpers [![CI Build](https://github.com/emberjs/ember-test-helpers/actions/workflows/ci-build.yml/badge.svg)](https://github.com/emberjs/ember-test-helpers/actions/workflows/ci-build.yml)
==============================================================================

A test-framework-agnostic set of helpers for testing Ember.js applications

Compatibility
------------------------------------------------------------------------------

- Ember.js v4 or above
- Ember CLI v4 or above
- Node.js v16 or above
- TypeScript 5.0, 5.1, 5.2, 5.3, 5.4, and 5.5
  - SemVer policy: [simple majors](https://www.semver-ts.org/#simple-majors)
  - the public API is defined by [API.md](./API.md).


Installation
------------------------------------------------------------------------------
### For ember-qunit v5 and above

#### pnpm
```bash
pnpm add --dev @ember/test-helpers
```

#### npm
```bash
npm install --save-dev @ember/test-helpers
```

### For ember-qunit v4 and below
If you are writing a regular Ember app or addon there is not much for you to
do as [ember-qunit](https://github.com/emberjs/ember-qunit) (and
[ember-mocha](https://github.com/emberjs/ember-mocha)) already include this
package as a dependency. You only need to make sure that you are using a
recent enough version of either one of these packages.

If you are working on `ember-qunit` or `ember-mocha` themselves you can
install this package like any other regular Ember addon. 


Usage
------------------------------------------------------------------------------

This package exports several helper functions that can be used to improve
the testing experience when developing Ember.js apps or addons.

These helper functions include DOM interaction helpers (`click()`, `fillIn()`,
...), routing and rendering helpers (`visit()`, `render()`, ...) and some
other things that make it easy to write good tests.

**The full documentation can be found in the [API reference](API.md).**


Contributing
------------------------------------------------------------------------------

### Installation

* `git clone https://github.com/emberjs/ember-test-helpers.git`
* `cd ember-test-helpers`
* `pnpm install`

### Running tests

* `cd test-app`
* Multiple ways of running the tests
    * `pnpm test`
    * `ember serve` + visit `/tests` in the browser
    * `ember test`
    * `ember test --server`

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).


Attribution
------------------------------------------------------------------------------

Much of `ember-test-helpers` was extracted from the original `ember-qunit`,
which was written by Stefan Penner, Robert Jackson, and Ryan Florence.


Copyright and License
------------------------------------------------------------------------------

Copyright 2015 [Switchfly](https://github.com/switchfly) and contributors.

Dual-licensed under the [Apache License, Version 2.0](./APACHE-LICENSE) and
the [MIT License](./MIT-LICENSE).
