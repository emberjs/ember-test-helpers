type AnyIfNeverElseT<T> = T extends never ? never : T;
type IsNever<T> = any extends AnyIfNeverElseT<T> ? never : T;
type NonNever<Types extends Array<unknown>> = {
    [Index in keyof Types]: IsNever<Types[Index]>;
}[number];
import type CPM_DTS from '@ember/engine/-private/container-proxy-mixin.d.ts';
import type RPM_DTS from '@ember/engine/-private/registry-proxy-mixin.d.ts';
import type CPM_4_8 from '@ember/engine/-private/container-proxy-mixin';
import type RPM_4_8 from '@ember/engine/-private/registry-proxy-mixin';
import type CPM_4_12 from '@ember/-internals/runtime/lib/mixins/container_proxy';
import type RPM_4_12 from '@ember/-internals/runtime/lib/mixins/registry_proxy';
import type { ContainerProxyMixin as CPM_stable } from '@ember/-internals/runtime';
import type { RegistryProxyMixin as RPM_stable } from '@ember/-internals/runtime';
export declare const ContainerProxyMixin: any;
export type ContainerProxyMixin = NonNever<[
    CPM_DTS,
    CPM_4_8,
    CPM_4_12,
    CPM_stable
]>;
export declare const RegistryProxyMixin: any;
export type RegistryProxyMixin = NonNever<[
    RPM_DTS,
    RPM_4_8,
    RPM_4_12,
    RPM_stable
]>;
export {};
//# sourceMappingURL=-owner-mixin-imports.d.ts.map