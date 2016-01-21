export default function qunitModuleFor(module) {
  QUnit.module(module.name, {
    setup: function(assert) {
      var done = assert.async();
      module.setup(assert)['finally'](done);
    },
    teardown: function(assert) {
      var done = assert.async();
      module.teardown(assert)['finally'](done);
    }
  });
}
