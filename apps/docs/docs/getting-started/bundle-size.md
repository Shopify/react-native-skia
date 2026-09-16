---
id: bundle-size
title: Bundle Size
sidebar_label: Bundle Size
slug: /getting-started/bundle-size
---

Below is the app size increase to be expected when adding React Native Skia to your project.

| Apple | Android | Web      |
| ----- | ------- | -------- |
| 6 MB  | 4 MB    | 2.9 MB\* |

\*This figure is the size of the gzipped file served through a CDN ([learn more](web)).

React Native Skia includes both prebuilt library files and C++ files that are compiled and linked with your app when being built - adding to the size of your app.

For a regular arm 64-bit **Android** device, the increased download size will be around **4 MB** added after adding React Native Skia - on **Apple**, the increased download size will be around **6 MB**.

Below is an explanation of how these numbers were found - using a bare-bones React Native app created with `npx react-native init` before and after adding React Native Skia.

## Android

_On *Android* you should use [App Bundles](https://developer.android.com/guide/app-bundle) to ensure that only the required files are downloaded to your user’s devices._

When building an APK in release mode, you will see an increase of 41.3 MB after adding React Native Skia.
This is because the library is built for different target architectures.
If we take `arm-64-bit` for instance, the `librnskia.so` library file is only around 3,8 MB.

This implies that if you distribute your apps using [App Bundles](https://developer.android.com/guide/app-bundle), the increase in download size should be around 4 MB on Android devices when distributed (including an increase of 220 KB to the Javascript Bundle).

### Apple

Unlike Android, there is no standard way to find the app size increase on iOS - but by archiving and distributing our build using the Ad-Hoc distribution method, we'll find some numbers in the report "App Thinning Size.txt":

**Base app:** 2,6 MB compressed, 7,2 MB uncompressed<br />
**With React Native Skia:** 5,2 MB compressed, 13 MB uncompressed

Meaning that we’ve increased the size of our app by around 5,8 MB after adding React Native Skia. If we add the increased Javascript bundle of about 220 KB, we end up with about 6 MB of increased download size after including React Native Skia.

## NPM Package

The npm download is bigger than these numbers indicate because we need to distribute Skia for all target platforms on both iOS and Android. The prebuilt binaries ship as separate packages that `@shopify/react-native-skia` depends on:

| Package                         | Needed for | Can be pruned? |
| ------------------------------- | ---------- | -------------- |
| `react-native-skia-apple-ios`   | iOS        | No             |
| `react-native-skia-android`     | Android    | No             |
| `react-native-skia-apple-macos` | macOS      | Yes            |
| `react-native-skia-apple-tvos`  | tvOS       | Yes            |

These affect the size of your `node_modules` and the time your installs and CI caches take — not the size of the app you ship. App size is determined by what actually gets linked, so an iOS-only app never ships the macOS or tvOS binaries either way.

### Pruning unused platforms

If you do want to keep them out of `node_modules`, redirect the unused packages to an empty local stub. Package managers cannot remove a dependency, but every one of them can override where it resolves from.

Create `stubs/skia-apple-macos/package.json` in your app:

```json
{ "name": "react-native-skia-apple-macos", "version": "0.0.0" }
```

That is the whole file — the version is required but is not checked, since overrides bypass range matching. Then point the dependency at it from your app's `package.json`:

```json
{
  "overrides": {
    "react-native-skia-apple-macos": "file:./stubs/skia-apple-macos"
  }
}
```

The field name depends on your package manager:

- **npm** and **Bun**: `overrides`, as above.
- **pnpm**: the same object, nested under `pnpm.overrides`.
- **Yarn Berry** (v2+): use `resolutions` with the `portal:` protocol instead of `file:`.

Repeat for `react-native-skia-apple-tvos` if you don't build for Apple TV.

### Why iOS and Android cannot be pruned

Both are resolved during the native build and fail loudly when missing — CocoaPods raises if `libs/ios` is absent, and Gradle raises if `react-native-skia-android` cannot be resolved. Note that Gradle runs whenever your app has an `android/` directory, even if you never ship an Android build, so pruning the Android package will break your build rather than shrink it.

`canvaskit-wasm` should also be left alone: it backs both the [web build](web) and the Jest mocks, so removing it breaks `yarn test` in apps that follow the [testing setup](installation#testing-with-jest).
