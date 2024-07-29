# How To Contribute

## Installation

* `git clone https://github.com/emberjs/ember-test-helpers.git`
* `cd ember-test-helpers`
* `pnpm install`

## Linting

* `pnpm lint`
* `pnpm lint:fix`

## Types

When updating the API, you will need to update the type tests (in `tests/api.ts`) as well. The kinds of changes required will make it clear whether the change is backwards compatible or not!

## Running tests

* `cd test-app`
* Multiple ways of running the tests
    * `pnpm test`
    * `ember serve` + visit `/tests` in the browser
    * `ember test`
    * `ember test --server`

## Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://cli.emberjs.com/release/](https://cli.emberjs.com/release/).
