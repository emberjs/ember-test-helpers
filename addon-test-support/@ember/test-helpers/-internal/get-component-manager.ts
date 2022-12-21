import Ember from 'ember';
import {
  macroCondition,
  importSync,
  dependencySatisfies,
} from '@embroider/macros';

let getComponentManager: (definition: object, owner: object) => unknown;

if (macroCondition(dependencySatisfies('ember-source', '>=3.27.0-alpha.1'))) {
  let _getComponentManager =
    //@ts-ignore
    importSync('@glimmer/manager').getInternalComponentManager;

  getComponentManager = (definition: object, owner: object) => {
    return _getComponentManager(definition, true);
  };
} else if (
  macroCondition(dependencySatisfies('ember-source', '>=3.25.0-beta.1'))
) {
  let _getComponentManager = (Ember as any).__loader.require(
    '@glimmer/manager'
  ).getInternalComponentManager;

  getComponentManager = (definition: object, owner: object) => {
    return _getComponentManager(definition, true);
  };
} else {
  let _getComponentManager = (Ember as any).__loader.require(
    '@glimmer/runtime'
  ).getComponentManager;

  getComponentManager = (definition: object, owner: object) => {
    return _getComponentManager(owner, definition);
  };
}

export default getComponentManager;
