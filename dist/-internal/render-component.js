import { macroCondition, appEmberSatisfies, importSync } from '@embroider/macros';

let renderComponent;
if (macroCondition(appEmberSatisfies('>=6.8.0-alpha.1'))) {
  renderComponent = importSync('@ember/renderer').renderComponent;
}
var renderComponent$1 = renderComponent;

export { renderComponent$1 as default };
//# sourceMappingURL=render-component.js.map
