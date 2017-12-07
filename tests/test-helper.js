import QUnit from 'qunit';
import { registerDeprecationHandler } from '@ember/debug';
import AbstractTestLoader from 'ember-cli-test-loader/test-support/index';
import Ember from 'ember';

if (QUnit.config.seed) {
  QUnit.config.reorder = false;
}

let moduleLoadFailures = [];
let cleanupFailures = [];

QUnit.done(function() {
  if (moduleLoadFailures.length) {
    throw new Error('\n' + moduleLoadFailures.join('\n'));
  }

  if (cleanupFailures.length) {
    throw new Error('\n' + cleanupFailures.join('\n'));
  }
});

class TestLoader extends AbstractTestLoader {
  moduleLoadFailure(moduleName, error) {
    moduleLoadFailures.push(error);

    QUnit.module('TestLoader Failures');
    QUnit.test(moduleName + ': could not be loaded', function() {
      throw error;
    });
  }
}

new TestLoader().loadModules();

let deprecations;
registerDeprecationHandler((message, options, next) => {
  // in case a deprecation is issued before a test is started
  if (!deprecations) {
    deprecations = [];
  }

  deprecations.push(message);
  next(message, options);
});

QUnit.testStart(function() {
  deprecations = [];
});

QUnit.testDone(function({ module, name }) {
  // this is used to ensure that no tests accidentally leak `Ember.testing` state
  if (Ember.testing) {
    let message = `Ember.testing should be reset after test has completed. ${module}: ${name} did not reset Ember.testing`;
    cleanupFailures.push(message);

    // eslint-disable-next-line
    console.error(message);
    Ember.testing = false;
  }

  // this is used to ensure that the testing container is always reset properly
  let testElementContainer = document.getElementById('ember-testing-container');
  let actual = testElementContainer.innerHTML;
  let expected = `<div id="ember-testing"></div>`;
  if (actual !== expected) {
    let message = `Expected #ember-testing-container to be reset after ${module}: ${name}, but was \`${actual}\``;
    cleanupFailures.push(message);

    // eslint-disable-next-line
    console.error(message);
    testElementContainer.innerHTML = expected;
  }
});

QUnit.assert.noDeprecations = function(callback) {
  let originalDeprecations = deprecations;
  deprecations = [];

  callback();
  this.deepEqual(deprecations, [], 'Expected no deprecations during test.');

  deprecations = originalDeprecations;
};

QUnit.assert.deprecations = function(callback, expectedDeprecations) {
  let originalDeprecations = deprecations;
  deprecations = [];

  callback();
  this.deepEqual(deprecations, expectedDeprecations, 'Expected deprecations during test.');

  deprecations = originalDeprecations;
};

QUnit.assert.deprecationsInclude = function(expected) {
  this.pushResult({
    result: deprecations.indexOf(expected) > -1,
    actual: deprecations,
    message: `expected to find \`${expected}\` deprecation`,
  });
};

// Monkey patch in the fix from https://github.com/qunitjs/qunit/pull/1233
// This can be removed after qunit > 2.4.1 has been released
const ASSERT_VERIFY_STEPS = QUnit.assert.verifySteps;
QUnit.assert.verifySteps = function() {
  ASSERT_VERIFY_STEPS.apply(this, arguments);
  this.test.steps.length = 0;
};
