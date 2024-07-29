import type { Resolver } from '@ember/owner';
import { ContainerProxyMixin, RegistryProxyMixin } from './-owner-mixin-imports';
interface Owner extends RegistryProxyMixin, ContainerProxyMixin {
}
declare const Owner: any;
/**
 * @private
 * @param {Object} resolver the resolver to use with the registry
 * @returns {Object} owner, container, registry
 */
export default function buildRegistry(resolver: Resolver): {
    registry: import("@ember/-internals/container/lib/registry").default;
    container: import("@ember/-internals/container/lib/container").default;
    owner: Owner;
};
export {};
//# sourceMappingURL=build-registry.d.ts.map