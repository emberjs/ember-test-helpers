/* globals Testem */
import * as QUnit from 'qunit';
import Ember from 'ember';
import { isSettled, getSettledState } from '@ember/test-helpers';
import { _backburner } from '@ember/runloop';
import './helpers/resolver';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';

import {
  getDeprecationsDuringCallback,
  getDeprecations,
} from '@ember/test-helpers';

setup(QUnit.assert);

if (QUnit.config.seed) {
  QUnit.config.reorder = false;
}

let moduleLoadFailures = [];
let cleanupFailures = [];
let asyncLeakageFailures = [];

_backburner.DEBUG = true;

QUnit.done(function () {
  if (moduleLoadFailures.length) {
    throw new Error('\n' + moduleLoadFailures.join('\n'));
  }

  if (cleanupFailures.length) {
    throw new Error('\n' + cleanupFailures.join('\n'));
  }

  if (asyncLeakageFailures.length) {
    throw new Error('\n' + asyncLeakageFailures.join('\n'));
  }
});

QUnit.testDone(function ({ module, name }) {
  // ensure no test accidentally change state of backburner.DEBUG
  if (_backburner.DEBUG !== true) {
    let message = `backburner.DEBUG should be reset (to true) after test has completed. ${module}: ${name} did not.`;
    cleanupFailures.push(message);

    // eslint-disable-next-line
    console.error(message);
    _backburner.DEBUG = true;
  }

  // this is used to ensure that no tests accidentally leak `Ember.testing` state
  if (Ember.testing) {
    let message = `Ember.testing should be reset after test has completed. ${module}: ${name} did not reset Ember.testing`;
    cleanupFailures.push(message);

    // eslint-disable-next-line
    console.error(message);
    Ember.testing = false;
  }

  if (!isSettled()) {
    let message = `Expected to be settled after ${module}: ${name}, but was \`${JSON.stringify(
      getSettledState()
    )}\``;
    asyncLeakageFailures.push(message);

    // eslint-disable-next-line
    console.error(message);
  }
});

function toAssertionMessage(assertionFailure) {
  return assertionFailure.message;
}

QUnit.assert.noDeprecations = function (callback) {
  this.deepEqual(
    getDeprecationsDuringCallback(callback).map(toAssertionMessage),
    [],
    'Expected no deprecations during test.'
  );
};

QUnit.assert.deprecations = function (callback, expectedDeprecations) {
  this.deepEqual(
    getDeprecationsDuringCallback(callback).map(toAssertionMessage),
    expectedDeprecations,
    'Expected deprecations during test.'
  );
};

QUnit.assert.deprecationsInclude = function (expected) {
  const deprecations = getDeprecations().map(toAssertionMessage);
  this.pushResult({
    result: deprecations.indexOf(expected) > -1,
    actual: deprecations,
    message: `expected to find \`${expected}\` deprecation`,
  });
};

start();

if (typeof Testem !== 'undefined') {
  Testem.hookIntoTestFramework();
}
