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
  return !!getComponentManager(maybeComponent, owner);
}

export default isComponent;
