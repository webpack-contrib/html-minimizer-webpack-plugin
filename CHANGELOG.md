# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [5.0.0](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/compare/v4.4.0...v5.0.0) (2024-01-17)


### ⚠ BREAKING CHANGES

* minimum supported Node.js version is `18.12.0` ([#127](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/issues/127)) ([57da672](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/commit/57da672f346933982869a70ae051d2bcfac3209c))

## [4.4.0](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/compare/v4.3.0...v4.4.0) (2023-06-10)


### Features

* added `@minify-html/node` support ([#117](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/issues/117)) ([966de45](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/commit/966de45db5de81fcb31da34efbe2946c5cb791b5))

## [4.3.0](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/compare/v4.2.1...v4.3.0) (2022-10-13)


### Features

* added `swcMinifyFragment` to minify HTML fragments ([021c752](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/commit/021c7524072328f9442604907656ad63227ef980))


### Bug Fixes

* compatibility with swc ([#87](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/issues/87)) ([afaf453](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/commit/afaf45329e4d50f015baf27a2cc9409efce3a946))

### [4.2.1](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/compare/v4.2.0...v4.2.1) (2022-10-06)


### Bug Fixes

* crash ([#86](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/issues/86)) ([f11fe4e](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/commit/f11fe4e59b9a81b79bd438aeed8570fe46683958))

## [4.2.0](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/compare/v4.1.0...v4.2.0) (2022-09-29)


### Features

* added `SWC` HTML minifier ([#81](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/issues/81)) ([8481f8c](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/commit/8481f8ce7d835470873cebb847cb636f9c8b52f5))

## [4.1.0](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/compare/v4.0.0...v4.1.0) (2022-08-17)


### Features

* update `html-minifier-terser` to v7 ([#78](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/issues/78)) ([4d9c5bf](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/commit/4d9c5bff31ce73fd08f6981700c61ac7b1fbbfc0))

## [4.0.0](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/compare/v3.5.0...v4.0.0) (2022-05-17)


### ⚠ BREAKING CHANGES

* minimum supported `Node.js` version is `14.15.0`

## [3.5.0](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/compare/v3.4.0...v3.5.0) (2021-12-16)


### Features

* removed cjs wrapper and generated types in commonjs format (`export =` and `namespaces` used in types), now you can directly use exported types ([e4c64c8](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/commit/e4c64c8c9d0cee2f6545893252738626d51503f1))

## [3.4.0](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/compare/v3.3.2...v3.4.0) (2021-12-06)


### Features

* added types ([#43](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/issues/43)) ([67338f0](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/commit/67338f0d92bf4adc5c49aeabb969b747bf877dd9))

### [3.3.2](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/compare/v3.3.1...v3.3.2) (2021-11-17)


### Chore

* update `schema-utils` package to `4.0.0` version

### [3.3.1](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/compare/v3.3.0...v3.3.1) (2021-11-08)

### Chore

* avoid usage `p-limit` package

## [3.3.0](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/compare/v3.2.0...v3.3.0) (2021-10-04)


### Features

* better validation errors ([#39](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/issues/39)) ([018d432](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/commit/018d432ca37362e66c7f6ef28834600747135fb7))


### Bug Fixes

* warning and error text messages ([#38](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/issues/38)) ([235429e](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/commit/235429ea476f9addbe7b5c3cbbb0a4fd3b40218f))

## [3.2.0](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/compare/v3.1.1...v3.2.0) (2021-08-31)


### Features

* update `html-minifier-terser` package ([#37](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/issues/37)) ([268a5e6](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/commit/268a5e6e5a3bb25bccdd9a3bc986bcd37688dfe9))

### [3.1.1](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/compare/v3.1.0...v3.1.1) (2021-06-25)

### Chore

* update `serialize-javascript`

## [3.1.0](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/compare/v3.0.0...v3.1.0) (2021-05-27)


### Features

* allow to return object in `minify` function ([43ae683](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/commit/43ae6838e54f5adea23e82c66db1fd493c7efd95))

## [3.0.0](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/compare/v2.1.0...v3.0.0) (2021-05-26)


### ⚠ BREAKING CHANGES

* minimum supported `Node.js` version is `12.13.0`

### Features

* added support multiple `minify` functions ([0763136](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/commit/0763136d7b763a9802f1b4da156518dc05f1ec2d))

## [2.1.0](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/compare/v2.0.0...v2.1.0) (2021-01-08)


### Features

* optimize HTML assets added later by plugins ([7198dac](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/commit/7198dac4f5c9a0b91e586d64b79ae16133a16447))

## [2.0.0](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/compare/v1.0.1...v2.0.0) (2020-11-09)


### ⚠ BREAKING CHANGES

* minimum supported `webpack` version is `5.1.0`
* removed the `cache` option (webpack automatically caches assets, please read https://webpack.js.org/configuration/other-options/#cache)
* removed the `cacheKeys` option (webpack automatically caches assets, please read https://webpack.js.org/configuration/other-options/#cache)

### [1.0.1](https://github.com/webpack-contrib/html-minimizer-webpack-plugin/compare/v1.0.0...v1.0.1) (2020-10-07)

### Chore

* update `schema-utils`

## 1.0.0 (2020-10-03)

Initial release

# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.
