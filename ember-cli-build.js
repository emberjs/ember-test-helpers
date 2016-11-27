var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
var Babel = require('broccoli-babel-transpiler');
var concat   = require('broccoli-sourcemap-concat');
var JSHint = require('broccoli-jshint');
var existsSync = require('exists-sync');

module.exports = function(options) {
  var project = options.project;
  project.initializeAddons();

  function addonTreesFor(type) {
    return project.addons.map(function(addon) {
      if (addon.treeFor) {
        return addon.treeFor(type);
      }
    }).filter(Boolean);
  }

  // --- Dependencies ---
  var addonVendorTrees = mergeTrees(addonTreesFor('vendor'));
  var loader = new Funnel(addonVendorTrees, {
    srcDir: 'loader',
    files: ['loader.js'],
    destDir: '/assets'
  });

  // --- Project Files  ---

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

  var libJSHint = new JSHint(lib);
  var testJSHint = new JSHint(tests);

  var mainTrees = [lib, tests, libJSHint, testJSHint];
  var addonTree = mergeTrees(addonTreesFor('addon'));
  var addonModulesTree = new Funnel(addonTree, {
    srcDir: 'modules',
    destDir: '/'
  });

  var main = mergeTrees(mainTrees.concat(addonModulesTree));
  // --- Compile ES6 modules ---

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

  var inputFiles = ['jquery/dist/jquery.js',
                    'ember/ember-template-compiler.js',
                    'ember/ember.debug.js',
                    'FakeXMLHttpRequest/fake_xml_http_request.js',
                    'route-recognizer/dist/route-recognizer.js',
                    'pretender/pretender.js'];

  if (existsSync('bower_components/ember-data/ember-data.js')) {
    inputFiles.push('ember-data/ember-data.js');
  }

  var vendor = concat('bower_components', {
    inputFiles: inputFiles,
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

  return mergeTrees([main, vendor, testIndex, qunit, loader, testSupport]);
};
