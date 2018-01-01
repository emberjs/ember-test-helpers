'use strict';

module.exports = {
  name: 'ember-test-helpers',

  init() {
    this._super.init && this._super.init.apply(this, arguments);

    // ensure `this.options` is setup properly, this is required by
    // ember-cli-htmlbars-inline-precompile so that it properly registers
    // itself with _our_ instance of ember-cli-babel and not the host
    // applications instance
    //
    // newer versions of ember-cli (2.12+) define `this.options` for us,
    // however older versions (e.g. 2.8) do not...
    this.options = this.options || {};
  },

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
