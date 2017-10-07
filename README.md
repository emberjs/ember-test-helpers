# ember-test-helpers [![Build Status](https://secure.travis-ci.org/emberjs/ember-test-helpers.png?branch=master)](http://travis-ci.org/emberjs/ember-test-helpers)

A test-framework-agnostic set of helpers for testing Ember.js applications.

## Usage

This library is best used by way of a test-framework-specific
wrapper, such as [ember-qunit](https://github.com/emberjs/ember-qunit) or
[ember-mocha](https://github.com/emberjs/ember-mocha).

## Test Helpers

### TestModule

The `TestModule` class is used to configure modules for unit testing
different aspects of your Ember application. This class can be extended to
create modules focused on particular types of unit tests.

`TestModule` is intended to be used in conjunction with modules specific to
a test framework. For instance, you could create QUnit-compatible modules with
a method such as:

```javascript
function moduleFor(name, description, callbacks) {
  let module = new TestModule(name, description, callbacks);

  QUnit.module(module.name, {
    beforeEach() {
      return module.setup();
    },
    afterEach() {
      return module.teardown();
    }
  });
}
```

------

`TestModule(name [, description [, callbacks]])`

* `name` - the full name of the test subject as it is registered in a container
(e.g. 'controller:application', 'route:index', etc.).

* `description` (optional) - the description of the test module as it should be
displayed in test output. If omitted, defaults to `name`.

* `callbacks` (optional) - an object that may include setup and teardown steps
as well as the other units needed by tests.

* `callbacks.resolver` (optional) - a Resolver instance to be used for the test
module. Takes precedence over the globally set Resolver.

### TestModuleForComponent

`TestModuleForComponent` extends `TestModule` to allow unit testing of Ember
Components.

------

`TestModuleForComponent(name [, description [, callbacks]])`

* `name` - the short name of the component that you'd use in a template
(e.g. 'x-foo', 'color-picker', etc.).

### TestModuleForModel

`TestModuleForModel` extends `TestModule` to allow unit testing of Ember Data
Models.

------

`TestModuleForModel(name [, description [, callbacks]])`

* `name` - the short name of the model that you'd use in store operations
(e.g. 'user', 'assignmentGroup', etc.).

### Miscellaneous Helpers

* `getContext` / `setContext` - access the context to be used in each test.

* `setResolver` - sets a Resolver globally which will be used to look up objects
from each test's container.

* `isolatedContainer` - creates a new isolated container for unit testing.

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
