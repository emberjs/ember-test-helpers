import type { Resolver } from '@ember/owner';
import EmberObject from '@ember/object';
import { Registry } from '@ember/-internals/container';
import type { FullName } from '@ember/owner';
import { ContainerProxyMixin, RegistryProxyMixin } from '@ember/-internals/runtime';
interface Owner extends RegistryProxyMixin, ContainerProxyMixin {
}
declare const Owner: Readonly<typeof EmberObject> & (new (owner?: import("@ember/owner").default) => EmberObject) & import("@ember/object/mixin").default & {
    _emberTestHelpersMockOwner: boolean;
    /**
     * Unregister a factory and its instance.
     *
     * Overrides `RegistryProxy#unregister` in order to clear any cached instances
     * of the unregistered factory.
     *
     * @param {string} fullName Name of the factory to unregister.
     *
     * @see {@link https://github.com/emberjs/ember.js/pull/12680}
     * @see {@link https://github.com/emberjs/ember.js/blob/v4.5.0-alpha.5/packages/%40ember/engine/instance.ts#L152-L167}
     */
    unregister(this: Owner, fullName: FullName): void;
};
/**
 * @private
 * @param {Object} resolver the resolver to use with the registry
 * @returns {Object} owner, container, registry
 */
export default function buildRegistry(resolver: Resolver): {
    registry: Registry;
    container: import("@ember/-internals/container").Container;
    owner: Owner;
};
export {};
//# sourceMappingURL=build-registry.d.ts.map