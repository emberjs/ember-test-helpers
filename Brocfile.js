var pickFiles  = require('broccoli-static-compiler');
var mergeTrees = require('broccoli-merge-trees');
var compileES6 = require('broccoli-es6modules');
var concat   = require('broccoli-sourcemap-concat');

// --- Compile ES6 modules ---

var loader = pickFiles('bower_components', {
  srcDir: 'loader.js',
  files: ['loader.js'],
  destDir: '/assets'
});

var klassy = pickFiles('bower_components', {
  srcDir: '/klassy/lib',
  files: ['klassy.js'],
  destDir: '/'
});

var lib = pickFiles('lib', {
  srcDir: '/',
  files: ['**/*.js'],
  destDir: '/'
});

var tests = pickFiles('tests', {
  srcDir: '/',
  files: ['test-support/*.js', '*.js'],
  destDir: '/tests'
});

var main = mergeTrees([klassy, lib, tests]);
main = new compileES6(main);

main = concat(main, {
  inputFiles: ['**/*.js'],
  outputFile: '/assets/ember-test-helpers-tests.amd.js'
});

// --- Select and concat vendor / support files ---

var vendor = concat('bower_components', {
  inputFiles: ['jquery/dist/jquery.js',
               'ember/ember-template-compiler.js',
               'ember/ember.debug.js',
               'ember-data/ember-data.js',
               'FakeXMLHttpRequest/fake_xml_http_request.js',
               'route-recognizer/dist/route-recognizer.js',
               'pretender/pretender.js'],
  outputFile: '/assets/vendor.js'
});

var pretender = pickFiles('bower_components', {

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

module.exports = mergeTrees([main, vendor, testIndex, qunit, loader, testSupport]);
