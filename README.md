# ember-test-helpers [![Build Status](https://secure.travis-ci.org/emberjs/ember-test-helpers.png?branch=master)](http://travis-ci.org/emberjs/ember-test-helpers)

A test-framework-agnostic set of helpers for testing Ember.js applications.

## Usage

This library is best used in conjunction with a test-framework-specific
wrapper, such as [ember-qunit](https://github.com/emberjs/ember-qunit) or
[ember-mocha](https://github.com/emberjs/ember-mocha).

This library was written using ES6 modules, which are contained in `lib/`.
These modules must be transpiled for pre-ES6 compatibility.

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
  var module = new TestModule(name, description, callbacks);

  QUnit.module(module.name, {
    beforeEach() {
      module.setup();
    },
    afterEach() {
      module.teardown();
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

* `setResolver` - sets the resolver which will be used to look up objects from
each test's container.

* `isolatedContainer` - creates a new isolated container for unit testing.

## Contributing

Contributions are welcome. Please follow the instructions below to install and
test this library.

### Installation

```sh
$ npm install
$ bower install
```

### Testing

In order to test in the browser:

```sh
$ npm start
```

... and then visit [http://localhost:4200/tests](http://localhost:4200/tests).

In order to perform a CI test:

```sh
$ npm test
```

## Attribution

Much of `ember-test-helpers` was extracted from the original `ember-qunit`,
which was written by Stefan Penner, Robert Jackson, and Ryan Florence.

## Copyright and License

Copyright 2015 [Switchfly](https://github.com/switchfly) and contributors.

Dual-licensed under the [Apache License, Version 2.0](./APACHE-LICENSE) and
the [MIT License](./MIT-LICENSE).
