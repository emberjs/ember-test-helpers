## v3.0.8 (2021-06-17)

#### :bug: Bug Fix
* [#147](https://github.com/broccolijs/broccoli-funnel/pull/147) Ensure adding additional trees does not affect include/exclude results. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v3.0.7 (2021-06-10)

#### :rocket: Enhancement
* [#146](https://github.com/broccolijs/broccoli-funnel/pull/146) Allow subclasses to add additional input nodes. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v3.0.6 (2021-05-26)

#### :bug: Bug Fix
* [#141](https://github.com/broccolijs/broccoli-funnel/pull/141) Stop gathering instantiation stack manually. ([@rwjblue](https://github.com/rwjblue))

#### :house: Internal
* [#145](https://github.com/broccolijs/broccoli-funnel/pull/145) Swap from yarn@1 to npm ([@rwjblue](https://github.com/rwjblue))
* [#144](https://github.com/broccolijs/broccoli-funnel/pull/144) Remove unused dependency (fast-ordered-set) ([@rwjblue](https://github.com/rwjblue))
* [#143](https://github.com/broccolijs/broccoli-funnel/pull/143) Remove usage of path-posix library. ([@rwjblue](https://github.com/rwjblue))
* [#142](https://github.com/broccolijs/broccoli-funnel/pull/142) Remove blank-object dependency. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v3.0.5 (2021-05-03)

#### :bug: Bug Fix
* [#136](https://github.com/broccolijs/broccoli-funnel/pull/136) Ensure current working directory files do not affect `broccoli-funnel` operation ([@ef4](https://github.com/ef4))

#### :house: Internal
* [#138](https://github.com/broccolijs/broccoli-funnel/pull/138) Add GH Actions CI ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Edward Faulkner ([@ef4](https://github.com/ef4))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v3.0.4 (2021-04-13)

#### :bug: Bug Fix
* [#135](https://github.com/broccolijs/broccoli-funnel/pull/135) fix srcDir + filtering ([@ef4](https://github.com/ef4))

#### Committers: 1
- Edward Faulkner ([@ef4](https://github.com/ef4))


## v3.0.3 (2020-05-09)

#### :bug: Bug Fix
* [#128](https://github.com/broccolijs/broccoli-funnel/pull/128) Support `srcDir` with leading slash ([@Gaurav0](https://github.com/Gaurav0))
* [#123](https://github.com/broccolijs/broccoli-funnel/pull/123) Ensure `lookupDestinationPath` will handle relative path ([@SparshithNR](https://github.com/SparshithNR))

#### :house: Internal
* [#131](https://github.com/broccolijs/broccoli-funnel/pull/131) Add release automation. ([@rwjblue](https://github.com/rwjblue))
* [#130](https://github.com/broccolijs/broccoli-funnel/pull/130) Fix test to actually check generated files with destDir ([@mmun](https://github.com/mmun))

#### Committers: 4
- Gaurav Munjal ([@Gaurav0](https://github.com/Gaurav0))
- Martin Muñoz ([@mmun](https://github.com/mmun))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- SparshithNRai ([@SparshithNR](https://github.com/SparshithNR))


# master

# 3.0.1

- Update all deps
- Removing all the fs operation. Use input/output
- Migrating to input/output facade

# 3.0.0

- [Breaking] Upgrading to latest broccoli-plugin (Breaking only because of node version drops)
- [Breaking] Modernize code: Class syntax, Async await etc.
- [Breaking] Drop Node 8, as that is EOL end of the month
- [Breaking] Drop Unsupported Node's (4, 6, 7) and add newly supported nodes (10, 12)

# 2.0.2

- Fix usage of `allowEmpty` when also using `include` / `exclude`

# 2.0.1

* Fixes issue with double dots in file names (#8) by using `fs.existSync` directly

# 2.0.0

* Drops support for `node@0.12`

# 1.2.0

* Improve excludes performance by using node-walk-sync for excludes when possible (#93)

# 1.1.0

* Opt out of cache directory creation.

# 1.0.7

* [PERF] when linking roots, only remove symlinks when absolutely needed.

# 1.0.6

* bump heimdall

# 1.0.5

* include only needed files

# 1.0.4

* switch to heimdalljs-logger, allowing logs to show context within the broccoli
  graph

# 1.0.3

* update fs-tree-diff, fixes "rename only file in directory bug", possible performance improvements.

# 1.0.2

* update minimatch

# 1.0.1

* fix annotations

# 1.0.0

* improve performance by improving output stability
* Do not use `CoreObject`
* Derive from broccoli-plugin base class

# 0.2.3

* Make `new` operator optional
* Use [new `.rebuild` API](https://github.com/broccolijs/broccoli/blob/master/docs/new-rebuild-api.md)
* Avoid mutating array arguments

# 0.2.2

No changelog beyond this point. Here be dragons.
