/* eslint-env node */
'use strict';

module.exports = {
  name: 'ember-test-helpers',

  treeForAddonTestSupport(tree) {
    // intentionally not calling _super here
    // so that can have our `import`'s be
    // import { ... } from 'ember-test-helpers';

    return this.preprocessJs(tree, '/', this.name, {
      registry: this.registry,
    });
  },
};
