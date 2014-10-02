# ember-test-helpers [![Build Status](https://secure.travis-ci.org/switchfly/ember-test-helpers.png?branch=master)](http://travis-ci.org/switchfly/ember-test-helpers)

A test-framework-agnostic set of helpers for testing Ember.js applications.

## Usage

These helpers are best used in conjunction with a test-framework-specific wrapper, such as
[ember-qunit](https://github.com/rwjblue/ember-qunit).

## Installation

```
$ npm install
$ bower install
$ npm install -g broccoli-cli
```

## Testing

In order to test in the browser:

```
$ broccoli serve
```

... and then visit [http://localhost:4200/tests](http://localhost:4200/tests).

In order to perform a CI test:

```
$ rm -rf build && BROCCOLI_ENV=test broccoli build build && testem ci
```

Or simply:

```
$ npm test
```

## Attribution

Much of `ember-test-helpers` was extracted from the original `ember-qunit`, which
was written by Stefan Penner, Robert Jackson, and  Ryan Florence. 

## Copyright and License

Copyright 2014 Switchfly and contributors.

Dual-licensed under the [Apache License, Version 2.0](./APACHE-LICENSE) and the [MIT License](./MIT-LICENSE).
