import QUnit from 'qunit';
import { registerDeprecationHandler } from '@ember/debug';
import AbstractTestLoader from 'ember-cli-test-loader/test-support/index';

let moduleLoadFailures = [];

QUnit.done(function() {
  if (moduleLoadFailures.length) {
    throw new Error('\n' + moduleLoadFailures.join('\n'));
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
  this.deepEqual(
    deprecations,
    expectedDeprecations,
    'Expected deprecations during test.'
  );

  deprecations = originalDeprecations;
};

QUnit.assert.deprecationsInclude = function(expected) {
  this.pushResult({
    result: deprecations.indexOf(expected) > -1,
    actual: deprecations,
    message: `expected to find \`${expected}\` deprecation`,
  });
};
