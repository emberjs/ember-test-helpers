# How To Contribute

## Installation

* `git clone <repository-url>`
* `cd ember-test-helpers`
* `yarn install`

## Linting

* `yarn lint`
* `yarn lint:fix`

## Types

When updating the API, you will need to update the type tests (in `tests/api.ts`) as well. The kinds of changes required will make it clear whether the change is backwards compatible or not!

## Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

## Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://cli.emberjs.com/release/](https://cli.emberjs.com/release/).
