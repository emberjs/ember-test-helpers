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
  // SAFETY: in more recent versions of @glimmer/manager,
  //         this throws an error when maybeComponent does not have
  //         an associated manager.
  try {
    return !!getComponentManager(maybeComponent, true);
  } catch (e) {
    if (
      `${e}`.includes(
        `wasn't a component manager associated with the definition`
      )
    ) {
      return false;
    }

    throw e;
  }
}

export default isComponent;
