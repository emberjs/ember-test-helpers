/* eslint-env node */
'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function (defaults) {
  let app = new EmberAddon(defaults);

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  app.import('node_modules/qunit/qunit/qunit.css', {
    type: 'test',
  });

  try {
    const { maybeEmbroider } = require('@embroider/test-setup'); // eslint-disable-line node/no-missing-require
    return maybeEmbroider(app);
  } catch (e) {
    // This exists, so that we can continue to support node 10 for some of our
    // test scenarios. Specifically those not scenario testing embroider. As
    // @embroider/test-setup and @embroider in no longer supports node 10
    if (e !== null && typeof e === 'object' && e.code === 'MODULE_NOT_FOUND') {
      return app.toTree();
    }
    throw e;
  }
};
