import Ember from 'ember';
import {
  macroCondition,
  importSync,
  dependencySatisfies,
} from '@embroider/macros';

let renderSettled: () => Promise<void>;

if (macroCondition(dependencySatisfies('ember-source', '>=4.4.0'))) {
  //@ts-ignore
  renderSettled = importSync('@ember/renderer').renderSettled;
} else if (macroCondition(dependencySatisfies('ember-source', '>=3.27.0'))) {
  //@ts-ignore
  renderSettled = importSync('@ember/-internals/glimmer').renderSettled;
} else {
  renderSettled = (Ember as any).__loader.require(
    '@ember/-internals/glimmer'
  ).renderSettled;
}

export default renderSettled;
