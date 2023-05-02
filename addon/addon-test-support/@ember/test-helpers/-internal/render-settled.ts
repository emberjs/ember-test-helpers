import {
  macroCondition,
  importSync,
  dependencySatisfies,
} from '@embroider/macros';

let renderSettled: () => Promise<void>;

if (macroCondition(dependencySatisfies('ember-source', '>=4.5.0-beta.1'))) {
  //@ts-ignore
  renderSettled = importSync('@ember/renderer').renderSettled;
} else {
  //@ts-ignore
  renderSettled = importSync('@ember/-internals/glimmer').renderSettled;
}

export default renderSettled;
