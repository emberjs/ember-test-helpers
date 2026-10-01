import type { ComponentLike } from '@glint/template';
/**
 * We should ultimately get a new API from @glimmer/runtime that provides this functionality
 * (see https://github.com/emberjs/rfcs/pull/785 for more info).
 * @private
 * @param {Object} maybeComponent The thing you think might be a component
 * @returns {boolean} True if it's a component, false if not
 */
declare function isComponent(maybeComponent: object): maybeComponent is ComponentLike;
export default isComponent;
//# sourceMappingURL=is-component.d.ts.map