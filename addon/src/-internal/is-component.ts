import { macroCondition, dependencySatisfies } from '@embroider/macros';
import type { ComponentLike } from '@glint/template';

import getComponentManager from './get-component-manager';

/**
 * We should ultimately get a new API from @glimmer/runtime that provides this functionality
 * (see https://github.com/emberjs/rfcs/pull/785 for more info).
 * @private
 * @param {Object} maybeComponent The thing you think might be a component
 * @param {Object} owner Owner, we need this for old versions of getComponentManager
 * @returns {boolean} True if it's a component, false if not
 */
function isComponent(
  maybeComponent: object,
  owner: object
): maybeComponent is ComponentLike {
  if (macroCondition(dependencySatisfies('ember-source', '>=3.25.0-beta.1'))) {
    return !!getComponentManager(maybeComponent, owner);
  } else {
    return (
      !!getComponentManager(maybeComponent, owner) ||
      ['@ember/component', '@ember/component/template-only'].includes(
        maybeComponent.toString()
      )
    );
  }
}

export default isComponent;
