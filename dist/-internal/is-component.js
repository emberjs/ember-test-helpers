import { getInternalComponentManager } from '@glimmer/manager';

// @ts-ignore: types for this API is not consistently available (via transitive
// deps) and we do not currently want to make it an explicit dependency. It
// does, however, consistently work at runtime. :sigh:

/**
 * We should ultimately get a new API from @glimmer/runtime that provides this functionality
 * (see https://github.com/emberjs/rfcs/pull/785 for more info).
 * @private
 * @param {Object} maybeComponent The thing you think might be a component
 * @returns {boolean} True if it's a component, false if not
 */
function isComponent(maybeComponent) {
  return !!getInternalComponentManager(maybeComponent, true);
}

export { isComponent as default };
//# sourceMappingURL=is-component.js.map
