// These utter shenanigans allow this to work regardless of what types you are
// importing from. The idea is: you supply multiple imports, each of which is
// mutually exclusive with the others in terms of valid imports, then ignore the
// imports so they type check, then "resolve" between them based on which one is
// actually defined. 😭
//
// TODO: at the next major version (4.0), when we drop support for Ember < 5.1
// or some later version and can therefore either depend *somewhat* more on
// these import locations *or* can drop them entirely (depending on the path
// taken in terms of the `Owner` stack), switch to the normal imports:
// ```
// import {
//   ContainerProxyMixin,
//   RegistryProxyMixin,
// } from '@ember/-internals/runtime';
// ```
//
// For now, we are stuck with this utterly horrifying hack to get the types for
// these reliably.

// This pair of types lets us check whether the imported type is set. We can
// then use that to pick between the imported types. The first type produces
// `any` when the type is otherwise not defined at all, which means we cannot
// use it directly because `any` will fall through, well, basically *any* check
// we might come up with... other than checking whether `any extends` it. The
// second uses that to get back a `never` so we can then "pick" between the
// imported types.
type AnyIfNeverElseT<T> = T extends never ? never : T;
type IsNever<T> = any extends AnyIfNeverElseT<T> ? never : T;

// This mapped type does the "picking". You can pass it any number of types,
// where only one should be available, and it will "resolve" that type.
// Constraint: the `Array` type must include mutually exclusive types, such that
// it should be impossible to ever get back more than one; otherwise, you will
// end up with a union type of the two. That is very unlikely to be what you
// want!
type NonNever<Types extends Array<unknown>> = {
  [Index in keyof Types]: IsNever<Types[Index]>;
}[number];

// Imports from `@types`
// @ts-ignore
import type CPM_DTS from '@ember/engine/-private/container-proxy-mixin.d.ts';
// @ts-ignore
import type RPM_DTS from '@ember/engine/-private/registry-proxy-mixin.d.ts';

// Imports from the preview types on 4.8
// @ts-ignore
import type CPM_4_8 from '@ember/engine/-private/container-proxy-mixin';
// @ts-ignore
import type RPM_4_8 from '@ember/engine/-private/registry-proxy-mixin';

// Imports from the preview types on 4.12
// @ts-ignore
import type CPM_4_12 from '@ember/-internals/runtime/lib/mixins/container_proxy';
// @ts-ignore
import type RPM_4_12 from '@ember/-internals/runtime/lib/mixins/registry_proxy';

// Imports available in the stable types
// @ts-ignore
import type { ContainerProxyMixin as CPM_stable } from '@ember/-internals/runtime';
// @ts-ignore
import type { RegistryProxyMixin as RPM_stable } from '@ember/-internals/runtime';

// We also resolve the *values* from a "stable" location. However, the *types*
// for the Ember namespace do not consistently include this definition (they do
// on the stable types, but not in the preview or DT types), so cast as `any` so
// that it resolves regardless.
import Ember from 'ember';
export const ContainerProxyMixin = (Ember as any)._ContainerProxyMixin;
export type ContainerProxyMixin = NonNever<
  [CPM_DTS, CPM_4_8, CPM_4_12, CPM_stable]
>;

export const RegistryProxyMixin = (Ember as any)._RegistryProxyMixin;
export type RegistryProxyMixin = NonNever<
  [RPM_DTS, RPM_4_8, RPM_4_12, RPM_stable]
>;
