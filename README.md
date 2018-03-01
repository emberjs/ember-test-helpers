@ember/test-helpers
==============================================================================

[![Build Status](https://secure.travis-ci.org/emberjs/ember-test-helpers.svg?branch=master)](http://travis-ci.org/emberjs/ember-test-helpers)

A test-framework-agnostic set of helpers for testing Ember.js applications

Installation
------------------------------------------------------------------------------

TBD


Usage
------------------------------------------------------------------------------

The exports of this library are intended to be utility functions that can be used to bring the
standard Ember testing experience to any testing framework.

This library is best used by way of a test-framework-specific
wrapper, such as [ember-qunit](https://github.com/emberjs/ember-qunit) or
[ember-mocha](https://github.com/emberjs/ember-mocha).

**Full documentation can be found in [API.md](API.md).**


Contributing
------------------------------------------------------------------------------

### Installation

* `git clone <repository-url>`
* `cd ember-test-helpers`
* `yarn install`

### Running tests

* `yarn test` (Runs `ember try:each` to test your addon against multiple Ember versions)
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
