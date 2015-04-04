export default function qunitModuleFor(module) {
  QUnit.module(module.name, {
    setup: function(assert) {
      var done = assert.async();
      module.setup()['finally'](done);
    },
    teardown: function(assert) {
      var done = assert.async();
      module.teardown()['finally'](done);
    }
  });
}
