/* eslint-env node */
'use strict';

module.exports = {
  name: 'ember-test-helpers',

  included() {
    this._super.included.apply(this, arguments);

    this.import('vendor/monkey-patches.js', { type: 'test' });
  },

  treeForAddonTestSupport(tree) {
    // intentionally not calling _super here
    // so that can have our `import`'s be
    // import { ... } from 'ember-test-helpers';

    return this.preprocessJs(tree, '/', this.name, {
      registry: this.registry,
    });
  },

  treeForVendor(rawVendorTree) {
    let babelAddon = this.addons.find(addon => addon.name === 'ember-cli-babel');

    let transpiledVendorTree = babelAddon.transpileTree(rawVendorTree, {
      'ember-cli-babel': {
        compileModules: false,
      },
    });

    return transpiledVendorTree;
  },
};
