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

// This mapped type does the "picking". You can pass it any number of types,
// where only one should be available, and it will "resolve" that type.
// Constraint: the `Array` type must include mutually exclusive types, such that
// it should be impossible to ever get back more than one; otherwise, you will
// end up with a union type of the two. That is very unlikely to be what you
// want!

// Imports from `@types`
// @ts-ignore

// @ts-ignore

// Imports from the preview types on 4.8
// @ts-ignore

// @ts-ignore

// Imports from the preview types on 4.12
// @ts-ignore

// @ts-ignore

// Imports available in the stable types
// @ts-ignore

// @ts-ignore

// We also resolve the *values* from a "stable" location. However, the *types*
// for the Ember namespace do not consistently include this definition (they do
// on the stable types, but not in the preview or DT types), so cast as `any` so
// that it resolves regardless.
import Ember from 'ember';
export const ContainerProxyMixin = Ember._ContainerProxyMixin;
export const RegistryProxyMixin = Ember._RegistryProxyMixin;