import Ember from 'ember';

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

const ContainerProxyMixin = Ember._ContainerProxyMixin;
const RegistryProxyMixin = Ember._RegistryProxyMixin;

export { ContainerProxyMixin, RegistryProxyMixin };
//# sourceMappingURL=-owner-mixin-imports.js.map
