/* globals define, self */

(function() {
  function vendorModule() {
    'use strict';

    return {
      default: self.QUnit,
      module: self.QUnit.module,
      test: self.QUnit.test,
      __esModule: true,
    };
  }

  define('qunit', [], vendorModule);
})();
