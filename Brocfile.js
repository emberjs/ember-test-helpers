var compileES6 = require('broccoli-es6-concatenator');
var pickFiles  = require('broccoli-static-compiler');
var mergeTrees = require('broccoli-merge-trees');

var loader = pickFiles('bower_components', {
  srcDir: 'loader',
  files: ['loader.js'],
  destDir: '/assets'
});

var testShims = pickFiles('bower_components', {
  srcDir: 'ember-cli-shims',
  files: ['app-shims.js'],
  destDir: '/assets'
});

var lib = mergeTrees([loader, 'lib']);

var tests = pickFiles('tests', {
  srcDir: '/',
  files: ['**/*.js'],
  destDir: '/tests'
});

var libAndTests = mergeTrees([lib, tests]);

var main = compileES6(libAndTests, {
  loaderFile: 'assets/loader.js',
  inputFiles: ['**/*.js'],
  ignoredModules: ['ember'],
  outputFile: '/js/ember-test-helpers.amd.js'
});

var qunit = pickFiles('bower_components', {
  srcDir: '/qunit/qunit',
  files: ['qunit.js', 'qunit.css'],
  destDir: '/assets'
});

var jQuery = pickFiles('bower_components', {
  srcDir: 'jquery/dist',
  files: ['jquery.js'],
  destDir: '/assets'
});

var handlebars = pickFiles('bower_components', {
  srcDir: 'handlebars',
  files: ['handlebars.js'],
  destDir: '/assets'
});

var ember = pickFiles('bower_components', {
  srcDir: 'ember',
  files: ['ember.js'],
  destDir: '/assets'
});

var emberData = pickFiles('bower_components', {
  srcDir: 'ember-data',
  files: ['ember-data.js'],
  destDir: '/assets'
});

var testLoader = pickFiles('bower_components', {
  srcDir: 'ember-cli-test-loader',
  files: ['test-loader.js'],
  destDir: '/assets'
});

var testIndex = pickFiles('tests', {
  srcDir: '/',
  files: ['index.html'],
  destDir: '/tests'
});

var assets = mergeTrees([testLoader, testIndex, qunit, jQuery, handlebars, loader, ember, emberData, testShims]);

module.exports = mergeTrees([main, assets]);

