import { macroCondition, dependencySatisfies, importSync } from '@embroider/macros';

let renderSettled;
if (macroCondition(dependencySatisfies('ember-source', '>=4.5.0-beta.1'))) {
  //@ts-ignore
  renderSettled = importSync('@ember/renderer').renderSettled;
} else {
  //@ts-ignore
  renderSettled = importSync('@ember/-internals/glimmer').renderSettled;
}
var renderSettled$1 = renderSettled;

export { renderSettled$1 as default };
//# sourceMappingURL=render-settled.js.map
