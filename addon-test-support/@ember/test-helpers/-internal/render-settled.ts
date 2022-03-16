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
} else if (macroCondition(dependencySatisfies('ember-source', '>=4.0.0'))) {
  //@ts-ignore
  renderSettled = importSync('@ember/-internals/glimmer').renderSettled;
} else if (macroCondition(dependencySatisfies('ember-source', '>=3.27.0'))) {
  //@ts-ignore
  renderSettled = importSync('@ember/-internals/glimmer').renderSettled;
} else if (macroCondition(dependencySatisfies('ember-source', '>=3.6.0'))) {
  renderSettled = (Ember as any).__loader.require(
    '@ember/-internals/glimmer'
  ).renderSettled;
} else if (macroCondition(dependencySatisfies('ember-source', '>=3.0.0'))) {
  renderSettled = renderSettled = (Ember as any).__loader.require(
    'ember-glimmer'
  ).renderSettled;
} else {
  throw new Error(
    'renderSettled is not available before v3.0 of ember-source.'
  );
}

export default renderSettled;
