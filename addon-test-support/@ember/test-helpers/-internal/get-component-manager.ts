import Ember from 'ember';
import {
  macroCondition,
  importSync,
  dependencySatisfies,
} from '@embroider/macros';
import { InternalComponentManager } from '@glimmer/interfaces';

let getComponentManager: (
  definition: object,
  isOptional?: boolean
) => InternalComponentManager | null;

if (macroCondition(dependencySatisfies('ember-source', '>=3.27.0'))) {
  getComponentManager =
    //@ts-ignore
    importSync('@glimmer/manager').getInternalComponentManager;
} else {
  getComponentManager = (Ember as any).__loader.require(
    '@glimmer/runtime'
  ).getComponentManager;
}

export default getComponentManager;
