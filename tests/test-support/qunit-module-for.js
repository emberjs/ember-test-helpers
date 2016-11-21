export default function qunitModuleFor(module) {
  QUnit.module(module.name, {
    setup(assert) {
      var done = assert.async();
      module.setup(assert)['finally'](done);
    },
    teardown(assert) {
      var done = assert.async();
      module.teardown(assert)['finally'](done);
    }
  });
}
