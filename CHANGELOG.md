# Changelog

### [1.4.2](https://github.com/askui/askui-reporters/compare/1.4.1...1.4.2) (2024-02-09)


### Features

* add option to AskuiAnnotationStepReporter to write screenshots ([b3d7c4c](https://github.com/askui/askui-reporters/commit/b3d7c4c5f3c3de9216536fe4887df32bf5907534))

### [1.4.1](https://github.com/askui/askui-reporters/compare/1.4.0...1.4.1) (2024-01-25)


### Bug Fixes

* Make fluent-ffmpeg and jest-html-reporters dependencies, so askui-reporters works directly after installation ([710d355](https://github.com/askui/askui-reporters/commit/710d35595d336da8b21b769d1672941f669501d8))

## [1.4.0](https://github.com/askui/askui-reporters/compare/1.3.1...1.4.0) (2024-01-21)


### Features

* Add first version of AskUIXRayReporter ([3fdfd8a](https://github.com/askui/askui-reporters/commit/3fdfd8a7c85cc8b82f1489092ab2b7c7a95b90ce))
* type instead of interface for XRayStep ([56cbca4](https://github.com/askui/askui-reporters/commit/56cbca491035c8915ba9d3fa110fee3faef7522d))

### [1.3.1](https://github.com/askui/askui-reporters/compare/1.3.0...1.3.1) (2023-09-27)


### Bug Fixes

* set peer dep version constraint correctly ([3e5fc7b](https://github.com/askui/askui-reporters/commit/3e5fc7be91578716578cb8cba442e337240e62f1))

### [1.3.0](https://github.com/askui/askui-reporters/compare/1.2.2...1.3.0) (2023-09-26)


* docs: switch allure and jest-html-reporters to have allure as preferred option come first by @adi-wan-askui in https://github.com/askui/askui-reporters/pull/17
* feat: remove private utils from public package api by @adi-wan-askui in https://github.com/askui/askui-reporters/pull/16
* Add AnnotationReporter which restores the behaviour of AnnotationLevel by @JohannesDienst-askui in https://github.com/askui/askui-reporters/pull/18

### [1.2.2](https://github.com/askui/askui-reporters/compare/1.2.1...1.2.2) (2023-09-07)

* use fork of jest-allure-circus (@askui/jest-allure-circus) to fix allure reporting

### [1.2.1](https://github.com/askui/askui-reporters/compare/1.2.0...1.2.1) (2023-09-05)


### Bug Fixes

* **allure:** rm quickfix for reporting on failed test status ([5d43513](https://github.com/askui/askui-reporters/commit/5d43513444d3c6cfe95b07f36be3becb4e99da38))

## [1.2.0](https://github.com/askui/askui-reporters/compare/1.0.4...1.2.0) (2023-07-13)


### Features

* make video reporting api consistent ([d1e8314](https://github.com/askui/askui-reporters/commit/d1e831431a89cb8c1bfe2c5664a68b2fbfeaf423))


### Bug Fixes

* passing reporter config to reporters ([edbea0b](https://github.com/askui/askui-reporters/commit/edbea0bc4a9c42c9bdadbb0e8806d809117695d1))

### [1.0.4](https://github.com/askui/askui-reporters/compare/1.0.3...1.0.4) (2023-07-10)

### [1.0.3](https://github.com/askui/askui-reporters/compare/1.0.2...1.0.3) (2023-07-10)


### Bug Fixes

* include necessary dependencies in dependencies property in package.json ([5fbc164](https://github.com/askui/askui-reporters/commit/5fbc16446c256aa22a5d20c363544f1e5ee87e12))

### [1.0.2](https://github.com/askui/askui-reporters/compare/1.0.1...1.0.2) (2023-07-10)

### [1.0.1](https://github.com/askui/askui-reporters/compare/1.1.0...1.0.1) (2023-07-10)

## 1.1.0 (2023-07-10)


### Features

* Add jest-html-reporters implementation ([36344e6](https://github.com/askui/askui-reporters/commit/36344e6004aafb79faff0d495dc85cf4da0bbef9))
* Review ready version askui-reporters npm package ([d48f2e5](https://github.com/askui/askui-reporters/commit/d48f2e5cd2d654c1530c134d38fda9313f271e3e))
* Review ready version askui-reporters npm package ([cc1d857](https://github.com/askui/askui-reporters/commit/cc1d8573b366d6d0288068953523e2ca375dee6d))


### Bug Fixes

* change workflow name; Try to get build to actually run. ([e2c1c2d](https://github.com/askui/askui-reporters/commit/e2c1c2d5b99236daefa2c5dcae217e0da619f634))
* Remove wrong exit code from scripts ([6e8e125](https://github.com/askui/askui-reporters/commit/6e8e1255f67985b1598a9f33fbb21e5574b2d813))
* Set correct name in workflow file ([7b54cdf](https://github.com/askui/askui-reporters/commit/7b54cdf145bfc68b6bf95e354105a5befce5bda7))
* Set default working-directory in workflow; Add missing scripts to package.json ([99f12e9](https://github.com/askui/askui-reporters/commit/99f12e94f2461ba09f83b131135377a7adb39a39))