import { macroCondition, dependencySatisfies } from '@embroider/macros';
import Component from '@ember/component';

import getComponentManager from './get-component-manager';

/**
 *
 * @private
 * @param {Object} maybeComponent The thing you think might be a component
 * @param {Object} owner Owner, we need this for old versions of getComponentManager
 * @returns {boolean} True if it's a component, false if not
 */
function isComponent(maybeComponent: object, owner: object): boolean {
  if (macroCondition(dependencySatisfies('ember-source', '>=3.25.0-beta.1'))) {
    return !!getComponentManager(maybeComponent, owner);
  } else {
    return (
      !!getComponentManager(maybeComponent, owner) ||
      maybeComponent instanceof Component ||
      maybeComponent.toString() === '@ember/component/template-only'
    );
  }
}

export default isComponent;
