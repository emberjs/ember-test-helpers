var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
var Babel = require('broccoli-babel-transpiler');
var concat   = require('broccoli-sourcemap-concat');

// --- Compile ES6 modules ---

var loader = new Funnel('bower_components', {
  srcDir: 'loader.js',
  files: ['loader.js'],
  destDir: '/assets'
});

var klassy = new Funnel('bower_components', {
  srcDir: '/klassy/lib',
  files: ['klassy.js'],
  destDir: '/'
});

var lib = new Funnel('lib', {
  srcDir: '/',
  include: ['**/*.js'],
  destDir: '/'
});

var tests = new Funnel('tests', {
  srcDir: '/',
  include: ['**/*.js'],
  destDir: '/tests'
});

var main = mergeTrees([klassy, lib, tests]);
main = new Babel(main, {
  loose: true,
  moduleIds: true,
  modules: 'amdStrict'
});

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

var qunit = new Funnel('bower_components', {
  srcDir: '/qunit/qunit',
  files: ['qunit.js', 'qunit.css'],
  destDir: '/assets'
});

var testIndex = new Funnel('tests', {
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
