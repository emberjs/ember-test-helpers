# Change Log

## [Unreleased](https://github.com/emberjs/ember-test-helpers/tree/HEAD)

[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.6.1...HEAD)

**Fixed bugs:**

- Deprecation Warning thrown Even when `needs:\[\]` is passed [\#195](https://github.com/emberjs/ember-test-helpers/issues/195)

**Merged pull requests:**

- Deprecation Warning thrown with `needs:\[\]` [\#196](https://github.com/emberjs/ember-test-helpers/pull/196) ([canufeel](https://github.com/canufeel))

## [v0.6.1](https://github.com/emberjs/ember-test-helpers/tree/v0.6.1) (2017-01-24)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.6.0...v0.6.1)

**Closed issues:**

- Release v0.6.0 [\#192](https://github.com/emberjs/ember-test-helpers/issues/192)
- Integration component test issues after v0.5.31 [\#176](https://github.com/emberjs/ember-test-helpers/issues/176)

**Merged pull requests:**

- Ember 2.12: Use factoryFor instead of lookupFactory, if available [\#194](https://github.com/emberjs/ember-test-helpers/pull/194) ([bwbuchanan](https://github.com/bwbuchanan))

## [v0.6.0](https://github.com/emberjs/ember-test-helpers/tree/v0.6.0) (2016-12-21)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.6.0-beta.1...v0.6.0)

**Implemented enhancements:**

- JSHint not catching missing semicolon's aka. replace JSHint with ESLint [\#70](https://github.com/emberjs/ember-test-helpers/issues/70)
- Replace JSHint with ESLint [\#190](https://github.com/emberjs/ember-test-helpers/pull/190) ([Turbo87](https://github.com/Turbo87))

**Closed issues:**

- Use ESLint instead of JSHint [\#189](https://github.com/emberjs/ember-test-helpers/issues/189)
- Update Ember CLI [\#185](https://github.com/emberjs/ember-test-helpers/issues/185)

**Merged pull requests:**

- README: Update links [\#193](https://github.com/emberjs/ember-test-helpers/pull/193) ([Turbo87](https://github.com/Turbo87))
- Cleanup package.json file [\#188](https://github.com/emberjs/ember-test-helpers/pull/188) ([Turbo87](https://github.com/Turbo87))
- Update dependencies [\#187](https://github.com/emberjs/ember-test-helpers/pull/187) ([Turbo87](https://github.com/Turbo87))
- Update QUnit module example [\#186](https://github.com/emberjs/ember-test-helpers/pull/186) ([martndemus](https://github.com/martndemus))

## [v0.6.0-beta.1](https://github.com/emberjs/ember-test-helpers/tree/v0.6.0-beta.1) (2016-11-27)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.34...v0.6.0-beta.1)

**Implemented enhancements:**

- Publish to npm [\#58](https://github.com/emberjs/ember-test-helpers/issues/58)

**Closed issues:**

- test-module-for-integration.js [\#182](https://github.com/emberjs/ember-test-helpers/issues/182)

**Merged pull requests:**

- Replace "klassy" with ES6 classes [\#183](https://github.com/emberjs/ember-test-helpers/pull/183) ([Turbo87](https://github.com/Turbo87))
- Overriding toString\(\) to return the test subject name [\#181](https://github.com/emberjs/ember-test-helpers/pull/181) ([kiwiupover](https://github.com/kiwiupover))

## [v0.5.34](https://github.com/emberjs/ember-test-helpers/tree/v0.5.34) (2016-10-03)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.33...v0.5.34)

**Closed issues:**

- Reset test elements instead of emptying them [\#178](https://github.com/emberjs/ember-test-helpers/issues/178)
- Regression with v0.5.26 [\#161](https://github.com/emberjs/ember-test-helpers/issues/161)

**Merged pull requests:**

- Reset ember-testing div to initial state on teardown [\#180](https://github.com/emberjs/ember-test-helpers/pull/180) ([trentmwillis](https://github.com/trentmwillis))
- Fix the build \(skipping a willDestroyElement test\) for canary builds. [\#179](https://github.com/emberjs/ember-test-helpers/pull/179) ([rwjblue](https://github.com/rwjblue))

## [v0.5.33](https://github.com/emberjs/ember-test-helpers/tree/v0.5.33) (2016-08-18)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.32...v0.5.33)

**Closed issues:**

- Ability to set Resolver per-module [\#173](https://github.com/emberjs/ember-test-helpers/issues/173)
- Callback context is inconsistent [\#133](https://github.com/emberjs/ember-test-helpers/issues/133)

**Merged pull requests:**

- Introduce resolver option to test module [\#174](https://github.com/emberjs/ember-test-helpers/pull/174) ([trentmwillis](https://github.com/trentmwillis))

## [v0.5.32](https://github.com/emberjs/ember-test-helpers/tree/v0.5.32) (2016-08-16)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.31...v0.5.32)

**Merged pull requests:**

- Allow test frameworks to set context to use. [\#175](https://github.com/emberjs/ember-test-helpers/pull/175) ([rwjblue](https://github.com/rwjblue))

## [v0.5.31](https://github.com/emberjs/ember-test-helpers/tree/v0.5.31) (2016-08-03)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.30...v0.5.31)

**Merged pull requests:**

- Enable usage when jQuery is not present. [\#172](https://github.com/emberjs/ember-test-helpers/pull/172) ([rwjblue](https://github.com/rwjblue))
- Avoid duplication between test-module-for-component and test-module-for-integration. [\#171](https://github.com/emberjs/ember-test-helpers/pull/171) ([rwjblue](https://github.com/rwjblue))

## [v0.5.30](https://github.com/emberjs/ember-test-helpers/tree/v0.5.30) (2016-08-01)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.29...v0.5.30)

**Merged pull requests:**

- Only append to the DOM when the first `this.render` is called. [\#170](https://github.com/emberjs/ember-test-helpers/pull/170) ([rwjblue](https://github.com/rwjblue))
- More alpha work. [\#169](https://github.com/emberjs/ember-test-helpers/pull/169) ([rwjblue](https://github.com/rwjblue))

## [v0.5.29](https://github.com/emberjs/ember-test-helpers/tree/v0.5.29) (2016-08-01)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.28...v0.5.29)

**Merged pull requests:**

- Start working on making the alpha pass. [\#168](https://github.com/emberjs/ember-test-helpers/pull/168) ([rwjblue](https://github.com/rwjblue))

## [v0.5.28](https://github.com/emberjs/ember-test-helpers/tree/v0.5.28) (2016-07-30)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.27...v0.5.28)

**Merged pull requests:**

- Call `Ember.ApplicationInstance.setupRegistry` if present. [\#167](https://github.com/emberjs/ember-test-helpers/pull/167) ([rwjblue](https://github.com/rwjblue))
- Updating Package Versions within current range [\#166](https://github.com/emberjs/ember-test-helpers/pull/166) ([elwayman02](https://github.com/elwayman02))

## [v0.5.27](https://github.com/emberjs/ember-test-helpers/tree/v0.5.27) (2016-06-20)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.26...v0.5.27)

**Closed issues:**

- Attempting to inject an unknown injection: `router:main` when running unit or integration tests for controllers or routes. [\#151](https://github.com/emberjs/ember-test-helpers/issues/151)

**Merged pull requests:**

- Fix the module-for-integration tests on Ember canary. [\#163](https://github.com/emberjs/ember-test-helpers/pull/163) ([rwjblue](https://github.com/rwjblue))
- export unsetContext from the main module [\#162](https://github.com/emberjs/ember-test-helpers/pull/162) ([CodeOfficer](https://github.com/CodeOfficer))

## [v0.5.26](https://github.com/emberjs/ember-test-helpers/tree/v0.5.26) (2016-06-07)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.25...v0.5.26)

**Closed issues:**

- Minor version 0.5.24 -\> 0.5.25 broke my tests [\#159](https://github.com/emberjs/ember-test-helpers/issues/159)

**Merged pull requests:**

- Fix regression related to DOM structure. [\#160](https://github.com/emberjs/ember-test-helpers/pull/160) ([rwjblue](https://github.com/rwjblue))

## [v0.5.25](https://github.com/emberjs/ember-test-helpers/tree/v0.5.25) (2016-06-06)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.24...v0.5.25)

**Closed issues:**

- can't test customEvents [\#75](https://github.com/emberjs/ember-test-helpers/issues/75)

**Merged pull requests:**

- Refactor `moduleForComponent` rendering to use outlet system. [\#158](https://github.com/emberjs/ember-test-helpers/pull/158) ([rwjblue](https://github.com/rwjblue))

## [v0.5.24](https://github.com/emberjs/ember-test-helpers/tree/v0.5.24) (2016-05-25)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.23...v0.5.24)

**Closed issues:**

- How should mutliple render calls in one test behave? [\#111](https://github.com/emberjs/ember-test-helpers/issues/111)

**Merged pull requests:**

- Ensure prior render is cleared when calling `this.render`. [\#155](https://github.com/emberjs/ember-test-helpers/pull/155) ([rwjblue](https://github.com/rwjblue))

## [v0.5.23](https://github.com/emberjs/ember-test-helpers/tree/v0.5.23) (2016-05-05)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.22...v0.5.23)

**Closed issues:**

- Component context should be cleaned up between integration tests? [\#149](https://github.com/emberjs/ember-test-helpers/issues/149)
- Check Ember.Test.waiters in wait helper [\#139](https://github.com/emberjs/ember-test-helpers/issues/139)

**Merged pull requests:**

- Fix the build... [\#154](https://github.com/emberjs/ember-test-helpers/pull/154) ([rwjblue](https://github.com/rwjblue))
- Use new path to loader.js [\#153](https://github.com/emberjs/ember-test-helpers/pull/153) ([danjamin](https://github.com/danjamin))
- Prefer Ember.assign over Ember.merge [\#150](https://github.com/emberjs/ember-test-helpers/pull/150) ([martndemus](https://github.com/martndemus))

## [v0.5.22](https://github.com/emberjs/ember-test-helpers/tree/v0.5.22) (2016-01-31)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.21...v0.5.22)

**Merged pull requests:**

- Test ember-data-2.3 in addon mode. [\#148](https://github.com/emberjs/ember-test-helpers/pull/148) ([rwjblue](https://github.com/rwjblue))
- Add `clearRender` method to allow testing of willDestroyElement. [\#147](https://github.com/emberjs/ember-test-helpers/pull/147) ([rwjblue](https://github.com/rwjblue))
- Add moduleForIntegration [\#144](https://github.com/emberjs/ember-test-helpers/pull/144) ([matteddy](https://github.com/matteddy))

## [v0.5.21](https://github.com/emberjs/ember-test-helpers/tree/v0.5.21) (2016-01-24)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.20...v0.5.21)

**Merged pull requests:**

- Avoid using DS.JSONAPIAdapter if module is present. [\#143](https://github.com/emberjs/ember-test-helpers/pull/143) ([rwjblue](https://github.com/rwjblue))
- Load the JSONAPIAdapter out of require instead of assuming its on a D… [\#142](https://github.com/emberjs/ember-test-helpers/pull/142) ([bmac](https://github.com/bmac))
- Add support for Ember Test registered waiters to wait helper [\#141](https://github.com/emberjs/ember-test-helpers/pull/141) ([adamjmcgrath](https://github.com/adamjmcgrath))

## [v0.5.20](https://github.com/emberjs/ember-test-helpers/tree/v0.5.20) (2016-01-23)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.19...v0.5.20)

**Closed issues:**

- Global DS with Ember Data 2.3 [\#140](https://github.com/emberjs/ember-test-helpers/issues/140)

**Merged pull requests:**

- Make build-registry work correctly when ember-data addon is used [\#138](https://github.com/emberjs/ember-test-helpers/pull/138) ([pangratz](https://github.com/pangratz))
- Change callback context to deprecate test module properties [\#136](https://github.com/emberjs/ember-test-helpers/pull/136) ([trentmwillis](https://github.com/trentmwillis))
- Add moduleForAcceptance [\#129](https://github.com/emberjs/ember-test-helpers/pull/129) ([matteddy](https://github.com/matteddy))

## [v0.5.19](https://github.com/emberjs/ember-test-helpers/tree/v0.5.19) (2015-12-12)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.18...v0.5.19)

## [v0.5.18](https://github.com/emberjs/ember-test-helpers/tree/v0.5.18) (2015-12-12)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.17...v0.5.18)

**Closed issues:**

- Return passed value from `set` and `setProperties` on integration tests [\#131](https://github.com/emberjs/ember-test-helpers/issues/131)

**Merged pull requests:**

- Enable publishing to NPM. [\#135](https://github.com/emberjs/ember-test-helpers/pull/135) ([rwjblue](https://github.com/rwjblue))
- Use NPM for klassy dep. [\#134](https://github.com/emberjs/ember-test-helpers/pull/134) ([rwjblue](https://github.com/rwjblue))
- Return passed in value for set and setProperties in integration test [\#132](https://github.com/emberjs/ember-test-helpers/pull/132) ([trentmwillis](https://github.com/trentmwillis))
- Add JSHint to project. [\#128](https://github.com/emberjs/ember-test-helpers/pull/128) ([rwjblue](https://github.com/rwjblue))
- Update ember-cli to latest released version. [\#123](https://github.com/emberjs/ember-test-helpers/pull/123) ([rwjblue](https://github.com/rwjblue))
- Provide better context for `subject\(\)` deprecation [\#57](https://github.com/emberjs/ember-test-helpers/pull/57) ([seanpdoyle](https://github.com/seanpdoyle))

## [v0.5.17](https://github.com/emberjs/ember-test-helpers/tree/v0.5.17) (2015-12-07)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.16...v0.5.17)

**Closed issues:**

- Tests fail for latest beta/canary [\#126](https://github.com/emberjs/ember-test-helpers/issues/126)
- Can no longer override registry in acceptance tests [\#124](https://github.com/emberjs/ember-test-helpers/issues/124)

**Merged pull requests:**

- Fix registry resolver for isolated container @2.3+ [\#127](https://github.com/emberjs/ember-test-helpers/pull/127) ([nickiaconis](https://github.com/nickiaconis))
- Restrict integration: 'legacy' to component tests. [\#122](https://github.com/emberjs/ember-test-helpers/pull/122) ([rwjblue](https://github.com/rwjblue))
- Add support for `integration: 'legacy'` [\#121](https://github.com/emberjs/ember-test-helpers/pull/121) ([rwjblue](https://github.com/rwjblue))

## [v0.5.16](https://github.com/emberjs/ember-test-helpers/tree/v0.5.16) (2015-11-10)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.15...v0.5.16)

**Merged pull requests:**

- Use newly exposed mixins to create owner. [\#119](https://github.com/emberjs/ember-test-helpers/pull/119) ([rwjblue](https://github.com/rwjblue))

## [v0.5.15](https://github.com/emberjs/ember-test-helpers/tree/v0.5.15) (2015-11-10)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.14...v0.5.15)

**Closed issues:**

- Events are fired twice for `onxxxx` type of handlers [\#116](https://github.com/emberjs/ember-test-helpers/issues/116)
- Injecting services for component integration tests doesn't seem to work [\#114](https://github.com/emberjs/ember-test-helpers/issues/114)

**Merged pull requests:**

- Work with `Ember.getOwner`. [\#118](https://github.com/emberjs/ember-test-helpers/pull/118) ([rwjblue](https://github.com/rwjblue))

## [v0.5.14](https://github.com/emberjs/ember-test-helpers/tree/v0.5.14) (2015-10-21)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.13...v0.5.14)

**Closed issues:**

- Implicit service injection fails in unit tests for dasherized names [\#108](https://github.com/emberjs/ember-test-helpers/issues/108)

**Merged pull requests:**

- Fix issues with normalization in primary \(non-fallback\) registry. [\#113](https://github.com/emberjs/ember-test-helpers/pull/113) ([rwjblue](https://github.com/rwjblue))

## [v0.5.13](https://github.com/emberjs/ember-test-helpers/tree/v0.5.13) (2015-10-20)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.12...v0.5.13)

**Closed issues:**

- TestModuleFor{App,Acceptance} proposal [\#94](https://github.com/emberjs/ember-test-helpers/issues/94)

**Merged pull requests:**

- Add `wait` helper. [\#112](https://github.com/emberjs/ember-test-helpers/pull/112) ([rwjblue](https://github.com/rwjblue))
- \[CLEANUP\] remove empty file [\#110](https://github.com/emberjs/ember-test-helpers/pull/110) ([pangratz](https://github.com/pangratz))
- Update README.md [\#107](https://github.com/emberjs/ember-test-helpers/pull/107) ([Kuzirashi](https://github.com/Kuzirashi))
- prepend tear down steps like tearDownForComponent in the begining of tearDownSteps array [\#104](https://github.com/emberjs/ember-test-helpers/pull/104) ([tsing80](https://github.com/tsing80))

## [v0.5.12](https://github.com/emberjs/ember-test-helpers/tree/v0.5.12) (2015-10-02)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.11...v0.5.12)

**Merged pull requests:**

- Guard for missing Ember.inject. [\#106](https://github.com/emberjs/ember-test-helpers/pull/106) ([rwjblue](https://github.com/rwjblue))

## [v0.5.11](https://github.com/emberjs/ember-test-helpers/tree/v0.5.11) (2015-10-01)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.10...v0.5.11)

**Merged pull requests:**

- Add public API for injection & registration [\#105](https://github.com/emberjs/ember-test-helpers/pull/105) ([ef4](https://github.com/ef4))
- Add `id` and `until` to deprecations. [\#102](https://github.com/emberjs/ember-test-helpers/pull/102) ([rwjblue](https://github.com/rwjblue))

## [v0.5.10](https://github.com/emberjs/ember-test-helpers/tree/v0.5.10) (2015-09-13)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.9...v0.5.10)

**Closed issues:**

- \[CANARY\] Test suite fails against ember-canary 2.2.0 [\#99](https://github.com/emberjs/ember-test-helpers/issues/99)
- No way to call component.didInsertElement\(\) in component integration test [\#84](https://github.com/emberjs/ember-test-helpers/issues/84)

**Merged pull requests:**

- Move action handling from module to context [\#101](https://github.com/emberjs/ember-test-helpers/pull/101) ([ef4](https://github.com/ef4))
- Do not register a router service for Ember \<1.13 [\#100](https://github.com/emberjs/ember-test-helpers/pull/100) ([mixonic](https://github.com/mixonic))
- Fix typo in thrown error [\#98](https://github.com/emberjs/ember-test-helpers/pull/98) ([HeroicEric](https://github.com/HeroicEric))

## [v0.5.9](https://github.com/emberjs/ember-test-helpers/tree/v0.5.9) (2015-08-20)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.8...v0.5.9)

**Merged pull requests:**

- Allow overriding services/factories in the registry. [\#96](https://github.com/emberjs/ember-test-helpers/pull/96) ([rwjblue](https://github.com/rwjblue))
- Update ember-try config. [\#95](https://github.com/emberjs/ember-test-helpers/pull/95) ([rwjblue](https://github.com/rwjblue))
- \[BUGFIX\] Pass in model name to `store.adapterFor` [\#93](https://github.com/emberjs/ember-test-helpers/pull/93) ([seanpdoyle](https://github.com/seanpdoyle))
- Throw when integration and needs declared [\#78](https://github.com/emberjs/ember-test-helpers/pull/78) ([bcardarella](https://github.com/bcardarella))
- Additional dom testing events. [\#66](https://github.com/emberjs/ember-test-helpers/pull/66) ([blimmer](https://github.com/blimmer))

## [v0.5.8](https://github.com/emberjs/ember-test-helpers/tree/v0.5.8) (2015-07-30)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.7...v0.5.8)

**Closed issues:**

- Recent view registry change breaks tests [\#91](https://github.com/emberjs/ember-test-helpers/issues/91)
- Deprecation message You tried to look up 'store:main', but this has been deprecated in favor of 'service:store' [\#65](https://github.com/emberjs/ember-test-helpers/issues/65)
- Deprecation message DS.FixtureAdapter has been deprecated [\#64](https://github.com/emberjs/ember-test-helpers/issues/64)

**Merged pull requests:**

- Ensure view-registry is injected for unit tested components. [\#92](https://github.com/emberjs/ember-test-helpers/pull/92) ([rwjblue](https://github.com/rwjblue))

## [v0.5.7](https://github.com/emberjs/ember-test-helpers/tree/v0.5.7) (2015-07-28)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.6...v0.5.7)

**Merged pull requests:**

- Consistently use the new view registry [\#90](https://github.com/emberjs/ember-test-helpers/pull/90) ([ef4](https://github.com/ef4))

## [v0.5.6](https://github.com/emberjs/ember-test-helpers/tree/v0.5.6) (2015-07-24)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.5...v0.5.6)

**Merged pull requests:**

- Add support for closure actions in component integration test [\#89](https://github.com/emberjs/ember-test-helpers/pull/89) ([martndemus](https://github.com/martndemus))
- Remove dependencies that are actually dev dependencies [\#88](https://github.com/emberjs/ember-test-helpers/pull/88) ([chadhietala](https://github.com/chadhietala))

## [v0.5.5](https://github.com/emberjs/ember-test-helpers/tree/v0.5.5) (2015-07-23)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.4...v0.5.5)

**Closed issues:**

- Angle bracket components error when resolving [\#77](https://github.com/emberjs/ember-test-helpers/issues/77)

**Merged pull requests:**

- ensure we correctly cleanup the context [\#87](https://github.com/emberjs/ember-test-helpers/pull/87) ([stefanpenner](https://github.com/stefanpenner))

## [v0.5.4](https://github.com/emberjs/ember-test-helpers/tree/v0.5.4) (2015-07-21)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.3...v0.5.4)

**Merged pull requests:**

- Avoid using container.register. [\#86](https://github.com/emberjs/ember-test-helpers/pull/86) ([rwjblue](https://github.com/rwjblue))

## [v0.5.3](https://github.com/emberjs/ember-test-helpers/tree/v0.5.3) (2015-07-21)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.2...v0.5.3)

**Closed issues:**

- "Render node exists without concomitant env" in 1.13.4 [\#76](https://github.com/emberjs/ember-test-helpers/issues/76)

**Merged pull requests:**

- Only override container methods if present. [\#85](https://github.com/emberjs/ember-test-helpers/pull/85) ([rwjblue](https://github.com/rwjblue))

## [v0.5.2](https://github.com/emberjs/ember-test-helpers/tree/v0.5.2) (2015-07-20)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.1...v0.5.2)

**Closed issues:**

- Does not work with Ember 2.0.0 beta 3 [\#80](https://github.com/emberjs/ember-test-helpers/issues/80)
- Component integration tests used deprecated Ember.View [\#59](https://github.com/emberjs/ember-test-helpers/issues/59)

**Merged pull requests:**

- Prevent errors when Ember.View / Ember.\_MetamorphView are undefined. [\#79](https://github.com/emberjs/ember-test-helpers/pull/79) ([rwjblue](https://github.com/rwjblue))
- allow getProperties and setProperties for component integration tests [\#68](https://github.com/emberjs/ember-test-helpers/pull/68) ([CodeOfficer](https://github.com/CodeOfficer))

## [v0.5.1](https://github.com/emberjs/ember-test-helpers/tree/v0.5.1) (2015-07-06)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.5.0...v0.5.1)

**Closed issues:**

- remove dependency on klassy, prefer raw JS or core-object [\#56](https://github.com/emberjs/ember-test-helpers/issues/56)
- Accessing store and other services from [\#50](https://github.com/emberjs/ember-test-helpers/issues/50)
- this.subject\(\) throws error in moduleForModel if { integration: true } [\#46](https://github.com/emberjs/ember-test-helpers/issues/46)
- TestModuleForComponent, integration: true, and {{link-to}} incompatible [\#41](https://github.com/emberjs/ember-test-helpers/issues/41)

**Merged pull requests:**

- Update test-module-for-model.js [\#74](https://github.com/emberjs/ember-test-helpers/pull/74) ([quaertym](https://github.com/quaertym))
- Guard against exceptions in the setup steps. [\#73](https://github.com/emberjs/ember-test-helpers/pull/73) ([winding-lines](https://github.com/winding-lines))
- Ember.keys is deprecated in favor of Object.keys [\#71](https://github.com/emberjs/ember-test-helpers/pull/71) ([jpadilla](https://github.com/jpadilla))
- punctual punctuation [\#69](https://github.com/emberjs/ember-test-helpers/pull/69) ([CodeOfficer](https://github.com/CodeOfficer))
- Add a test for {{component}} helper [\#62](https://github.com/emberjs/ember-test-helpers/pull/62) ([ef4](https://github.com/ef4))
- Don't replace Ember's internal view:toplevel [\#61](https://github.com/emberjs/ember-test-helpers/pull/61) ([ef4](https://github.com/ef4))
- Compatibility with Ember 1.13+ [\#60](https://github.com/emberjs/ember-test-helpers/pull/60) ([ef4](https://github.com/ef4))

## [v0.5.0](https://github.com/emberjs/ember-test-helpers/tree/v0.5.0) (2015-05-18)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.4.6...v0.5.0)

**Merged pull requests:**

- Remove isolatedContainer and use Ember.Application.buildRegistry. [\#49](https://github.com/emberjs/ember-test-helpers/pull/49) ([rwjblue](https://github.com/rwjblue))

## [v0.4.6](https://github.com/emberjs/ember-test-helpers/tree/v0.4.6) (2015-05-18)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.4.5...v0.4.6)

**Closed issues:**

- moduleForComponent accepts 3 or 1 argument, should also accept 2 [\#52](https://github.com/emberjs/ember-test-helpers/issues/52)
- Feature request: support for block-params [\#40](https://github.com/emberjs/ember-test-helpers/issues/40)
- Proposal: switching to template-driven component integration tests [\#25](https://github.com/emberjs/ember-test-helpers/issues/25)

**Merged pull requests:**

- Ensure moduleForComponent with description works. [\#53](https://github.com/emberjs/ember-test-helpers/pull/53) ([rwjblue](https://github.com/rwjblue))

## [v0.4.5](https://github.com/emberjs/ember-test-helpers/tree/v0.4.5) (2015-05-14)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.4.4...v0.4.5)

**Closed issues:**

- Needs no longer optional in v0.4.4? Unit tests deprecated? [\#47](https://github.com/emberjs/ember-test-helpers/issues/47)
- New factories in isolatedContainer for Glimmer [\#43](https://github.com/emberjs/ember-test-helpers/issues/43)

**Merged pull requests:**

- Allow missing arguments for `moduleForComponent`. [\#48](https://github.com/emberjs/ember-test-helpers/pull/48) ([rwjblue](https://github.com/rwjblue))
- Add javascript syntax highlighting to README example [\#45](https://github.com/emberjs/ember-test-helpers/pull/45) ([HeroicEric](https://github.com/HeroicEric))

## [v0.4.4](https://github.com/emberjs/ember-test-helpers/tree/v0.4.4) (2015-05-06)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.4.3...v0.4.4)

**Merged pull requests:**

- Add container items required for Glimmer. [\#44](https://github.com/emberjs/ember-test-helpers/pull/44) ([rwjblue](https://github.com/rwjblue))
- Delegate to DS.\_setupContainer when available to register service:store [\#39](https://github.com/emberjs/ember-test-helpers/pull/39) ([bmac](https://github.com/bmac))
- Support component integration tests [\#38](https://github.com/emberjs/ember-test-helpers/pull/38) ([ef4](https://github.com/ef4))
- Add automated testing against many Ember versions. [\#35](https://github.com/emberjs/ember-test-helpers/pull/35) ([rwjblue](https://github.com/rwjblue))

## [v0.4.3](https://github.com/emberjs/ember-test-helpers/tree/v0.4.3) (2015-04-04)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.4.2...v0.4.3)

**Merged pull requests:**

- Use container to register custom DS keys. [\#34](https://github.com/emberjs/ember-test-helpers/pull/34) ([dgeb](https://github.com/dgeb))

## [v0.4.2](https://github.com/emberjs/ember-test-helpers/tree/v0.4.2) (2015-04-04)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.4.1...v0.4.2)

**Closed issues:**

- isolated-container depends on private view [\#30](https://github.com/emberjs/ember-test-helpers/issues/30)

**Merged pull requests:**

- Register some built in Ember Data objects if ED exists on the page. [\#33](https://github.com/emberjs/ember-test-helpers/pull/33) ([bmac](https://github.com/bmac))
- Asynchronous module hooks [\#32](https://github.com/emberjs/ember-test-helpers/pull/32) ([ef4](https://github.com/ef4))

## [v0.4.1](https://github.com/emberjs/ember-test-helpers/tree/v0.4.1) (2015-03-24)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.4.0...v0.4.1)

**Merged pull requests:**

- Ensure `moduleForModel` uses the correct store for `subject`. [\#28](https://github.com/emberjs/ember-test-helpers/pull/28) ([rwjblue](https://github.com/rwjblue))

## [v0.4.0](https://github.com/emberjs/ember-test-helpers/tree/v0.4.0) (2015-03-17)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.3.6...v0.4.0)

**Merged pull requests:**

- \[breaking\] Remove `view.$\(\)` call in `render\(\)` of module for component [\#27](https://github.com/emberjs/ember-test-helpers/pull/27) ([bantic](https://github.com/bantic))

## [v0.3.6](https://github.com/emberjs/ember-test-helpers/tree/v0.3.6) (2015-03-12)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.3.5...v0.3.6)

**Merged pull requests:**

- Move integration container logic to TestModule [\#24](https://github.com/emberjs/ember-test-helpers/pull/24) ([nikz](https://github.com/nikz))

## [v0.3.5](https://github.com/emberjs/ember-test-helpers/tree/v0.3.5) (2015-03-11)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.3.4...v0.3.5)

**Closed issues:**

- setup and teardown are not passing original arguments from frameworks [\#22](https://github.com/emberjs/ember-test-helpers/issues/22)

**Merged pull requests:**

- Set `registry.normalizeFullName` to `resolver.normalize`. [\#23](https://github.com/emberjs/ember-test-helpers/pull/23) ([dgeb](https://github.com/dgeb))
- Adding standalone integration test support [\#21](https://github.com/emberjs/ember-test-helpers/pull/21) ([ef4](https://github.com/ef4))

## [v0.3.4](https://github.com/emberjs/ember-test-helpers/tree/v0.3.4) (2015-02-22)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.3.3...v0.3.4)

**Merged pull requests:**

- Fix `afterTeardown` callback removal. [\#19](https://github.com/emberjs/ember-test-helpers/pull/19) ([rwjblue](https://github.com/rwjblue))
- destroy the subject in teardown [\#18](https://github.com/emberjs/ember-test-helpers/pull/18) ([CodeOfficer](https://github.com/CodeOfficer))
- make sure bower\_components folder is where broccoli expects [\#17](https://github.com/emberjs/ember-test-helpers/pull/17) ([CodeOfficer](https://github.com/CodeOfficer))

## [v0.3.3](https://github.com/emberjs/ember-test-helpers/tree/v0.3.3) (2015-02-19)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.3.2...v0.3.3)

**Merged pull requests:**

- Component not in dom in willDestroyElement [\#16](https://github.com/emberjs/ember-test-helpers/pull/16) ([craigteegarden](https://github.com/craigteegarden))

## [v0.3.2](https://github.com/emberjs/ember-test-helpers/tree/v0.3.2) (2015-02-10)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.3.1...v0.3.2)

**Merged pull requests:**

- Expose registry methods from isolatedContainer without deprecations. [\#15](https://github.com/emberjs/ember-test-helpers/pull/15) ([dgeb](https://github.com/dgeb))
- Ensure callbacks are called in the test module's context. [\#14](https://github.com/emberjs/ember-test-helpers/pull/14) ([dgeb](https://github.com/dgeb))

## [v0.3.1](https://github.com/emberjs/ember-test-helpers/tree/v0.3.1) (2015-02-08)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.3.0...v0.3.1)

**Merged pull requests:**

- Upgrade ember to 1.10.0 and remove handlebars. [\#13](https://github.com/emberjs/ember-test-helpers/pull/13) ([dgeb](https://github.com/dgeb))

## [v0.3.0](https://github.com/emberjs/ember-test-helpers/tree/v0.3.0) (2015-01-31)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.2.0...v0.3.0)

**Merged pull requests:**

- Ensure that `setup` callback is invoked with the correct context. [\#12](https://github.com/emberjs/ember-test-helpers/pull/12) ([rwjblue](https://github.com/rwjblue))
- Use ember-cli for easier building. [\#11](https://github.com/emberjs/ember-test-helpers/pull/11) ([rwjblue](https://github.com/rwjblue))

## [v0.2.0](https://github.com/emberjs/ember-test-helpers/tree/v0.2.0) (2015-01-22)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.1.0...v0.2.0)

## [v0.1.0](https://github.com/emberjs/ember-test-helpers/tree/v0.1.0) (2015-01-22)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.0.7...v0.1.0)

**Merged pull requests:**

- Update ES6 module transpiler and proper sourcemap concatenation [\#10](https://github.com/emberjs/ember-test-helpers/pull/10) ([chadhietala](https://github.com/chadhietala))
- Move to loader.js@3.0.0 and use ember-cli dependencies [\#9](https://github.com/emberjs/ember-test-helpers/pull/9) ([chadhietala](https://github.com/chadhietala))

## [v0.0.7](https://github.com/emberjs/ember-test-helpers/tree/v0.0.7) (2014-11-19)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.0.6...v0.0.7)

**Merged pull requests:**

- The isolated container exposes Ember's controllers. [\#4](https://github.com/emberjs/ember-test-helpers/pull/4) ([cyril-sf](https://github.com/cyril-sf))
- Make sure container and resolver normalize the same way [\#2](https://github.com/emberjs/ember-test-helpers/pull/2) ([marcoow](https://github.com/marcoow))

## [v0.0.6](https://github.com/emberjs/ember-test-helpers/tree/v0.0.6) (2014-10-20)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.0.5...v0.0.6)

## [v0.0.5](https://github.com/emberjs/ember-test-helpers/tree/v0.0.5) (2014-10-14)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.0.4...v0.0.5)

## [v0.0.4](https://github.com/emberjs/ember-test-helpers/tree/v0.0.4) (2014-10-14)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.0.3...v0.0.4)

## [v0.0.3](https://github.com/emberjs/ember-test-helpers/tree/v0.0.3) (2014-10-07)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.0.2...v0.0.3)

**Closed issues:**

- Configure testem for CI testing [\#1](https://github.com/emberjs/ember-test-helpers/issues/1)

## [v0.0.2](https://github.com/emberjs/ember-test-helpers/tree/v0.0.2) (2014-10-02)
[Full Changelog](https://github.com/emberjs/ember-test-helpers/compare/v0.0.1...v0.0.2)

## [v0.0.1](https://github.com/emberjs/ember-test-helpers/tree/v0.0.1) (2014-05-03)


\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*