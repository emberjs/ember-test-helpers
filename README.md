# @ember/test-helpers [![Build Status](https://secure.travis-ci.org/emberjs/ember-test-helpers.png?branch=master)](http://travis-ci.org/emberjs/ember-test-helpers)

A test-framework-agnostic set of helpers for testing Ember.js applications.

## Usage

This library is best used by way of a test-framework-specific
wrapper, such as [ember-qunit](https://github.com/emberjs/ember-qunit) or
[ember-mocha](https://github.com/emberjs/ember-mocha).

## Test Helpers

The exports of this library are intended to be utility functions that can be used to bring the
standard Ember testing experience to any testing framework.

A quick summary of the exports from the `ember-test-helpers` module:

* `setApplication` - This function is used to allow the rest of the setup
  functions to build a valid container/registry which can be used to lookup
  instances and factories from your application.
* `setResolver` - When `setApplication` has not been ran, this function is used to allow the other
  functions build a valid container/registry that is able to look objects up
  from your application (just as a running Ember application would).
* `setContext` - Invoked by the host testing framework to set the current testing context (generally
  the `this` within a running test).
* `getContext` - Used to retrieve the current testing context.
* `unsetContext` - Used to ensure that all handles on the testing context are released (allowing GC).
* `setupContext` - Sets up a given testing context with `owner`, `get`, `set`, etc properties.
* `teardownContext` - Cleans up any objects created as part of the owner created in `setupContext`.
* `setupRenderingContext` - Sets up the provided context with the ability to render template
  snippets by adding `render`, `clearRender`, etc.
* `teardownRenderingContext` - Cleans up any work done in a rendering test.
* `settled` - Returns a promise which will resolve when all async from AJAX, test waiters, and 
  scheduled timers have completed.
* `validateErrorHandler` - Used to ensure that the `Ember.onerror` error handler properly re-throws any errors during testing.

## Collaborating

### Installation

* `git clone <repository-url>` this repository
* `cd ember-test-helpers`
* `npm install`

### Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

### Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

## Attribution

Much of `ember-test-helpers` was extracted from the original `ember-qunit`,
which was written by Stefan Penner, Robert Jackson, and Ryan Florence.

## Copyright and License

Copyright 2015 [Switchfly](https://github.com/switchfly) and contributors.

Dual-licensed under the [Apache License, Version 2.0](./APACHE-LICENSE) and
the [MIT License](./MIT-LICENSE).
