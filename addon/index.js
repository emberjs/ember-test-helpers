'use strict';

const BroccoliDebug = require('broccoli-debug');
const debugTree = BroccoliDebug.buildDebugCallback('ember-test-helpers');

module.exports = {
  name: require('./package').name,

  treeForAddonTestSupport(tree) {
    let input = debugTree(tree, 'addon-test-support:input');

    if (this.isDevelopingAddon()) {
      const {
        BroccoliBabelPresetTypeScript,
      } = require('broccoli-babel-preset-typescript'); // eslint-disable-line node/no-unpublished-require
      input = new BroccoliBabelPresetTypeScript([input]);
    }

    const output = this.preprocessJs(input, '/', this.name, {
      registry: this.registry,
      treeType: 'addon-test-support',
    });

    return debugTree(output, 'addon-test-support:output');
  },
};
