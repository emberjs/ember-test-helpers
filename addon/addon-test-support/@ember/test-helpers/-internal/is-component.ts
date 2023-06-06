import type { ComponentLike } from '@glint/template';

import { getInternalComponentManager as getComponentManager } from '@glimmer/manager';

/**
 * We should ultimately get a new API from @glimmer/runtime that provides this functionality
 * (see https://github.com/emberjs/rfcs/pull/785 for more info).
 * @private
 * @param {Object} maybeComponent The thing you think might be a component
 * @returns {boolean} True if it's a component, false if not
 */
function isComponent(maybeComponent: object): maybeComponent is ComponentLike {
  return !!getComponentManager(maybeComponent, true);
}

export default isComponent;
