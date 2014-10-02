var concat     = require('broccoli-concat');
var pickFiles  = require('broccoli-static-compiler');
var mergeTrees = require('broccoli-merge-trees');
var compileES6 = require('broccoli-es6-concatenator');

var loader = pickFiles('bower_components', {
  srcDir: 'loader',
  files: ['loader.js'],
  destDir: '/assets'
});

var tests = pickFiles('tests', {
  srcDir: '/',
  files: ['test-support/*.js', '*.js'],
  destDir: '/tests'
});

var libAndTests = mergeTrees([loader, 'lib', tests]);
libAndTests = compileES6(libAndTests, {
  loaderFile: 'assets/loader.js',
  inputFiles: ['**/*.js'],
  ignoredModules: ['ember'],
  outputFile: '/assets/ember-test-helpers-tests.amd.js'
});

var vendor = concat('bower_components', {
  inputFiles: ['jquery/dist/jquery.js',
               'handlebars/handlebars.js',
               'ember/ember.js',
               'ember-data/ember-data.js'],
  outputFile: '/assets/vendor.js'
});

var qunit = pickFiles('bower_components', {
  srcDir: '/qunit/qunit',
  files: ['qunit.js', 'qunit.css'],
  destDir: '/assets'
});

var testIndex = pickFiles('tests', {
  srcDir: '/',
  files: ['index.html'],
  destDir: '/tests'
});

var testSupport = concat('bower_components', {
  inputFiles: ['ember-cli-shims/app-shims.js',
               'ember-cli-test-loader/test-loader.js'],
  outputFile: '/assets/test-support.js'
});

module.exports = mergeTrees([libAndTests, vendor, testIndex, qunit, testSupport]);

