import {
  macroCondition,
  importSync,
  dependencySatisfies,
} from '@embroider/macros';

let renderSettled: () => Promise<void>;

if (macroCondition(dependencySatisfies('ember-source', '>=4.5.0-beta.1'))) {
  //@ts-ignore
  renderSettled = importSync('@ember/renderer').renderSettled;
} else if (
  macroCondition(dependencySatisfies('ember-source', '>=4.0.0-alpha.1'))
) {
  //@ts-ignore
  renderSettled = importSync('@ember/-internals/glimmer').renderSettled;
} else {
  throw new Error('Using an unsupported version of Ember  (@ember/test-helpers@3.0.0+ requires Ember 4 or higher)');
}

export default renderSettled;
