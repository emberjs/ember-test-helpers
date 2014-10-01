export default function qunitModuleFor(module) {
  QUnit.module(module.name, {
    setup: function() {
      module.setup();
    },
    teardown: function() {
      module.teardown();
    }
  });
}
