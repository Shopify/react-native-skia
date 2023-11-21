---
id: installation
title: Installation
sidebar_label: Installation
slug: /getting-started/installation
---

React Native Skia brings the [Skia Graphics Library](https://skia.org/) to React Native.
Skia serves as the graphics engine for Google Chrome and Chrome OS, Android, Flutter, Mozilla Firefox, Firefox OS, and many other products.

> **Version compatibility:**  
> `react-native@>=0.66` and `react@>=18` are required.
> In addition you should make sure you're on at least `iOS 13` and `Android API level 16` or above.
> To use React Native Skia with the new architecture, `react-native@>=0.72` is required.

**Install the library using yarn:**

```sh
yarn add @shopify/react-native-skia
```

**Or using npm:**

```sh
npm install @shopify/react-native-skia
```

### Bundle Size

Below is the app size increase to be expected when adding React Native Skia to your project ([learn more](bundle-size)).

| iOS  | Android | Web    |
| ---- | ------- | ------ |
| 6 MB | 4 MB    | 2.9 MB |

## iOS

Run `pod install` on the `ios/` directory.

## Android

Currently, you will need Android NDK to be installed.
If you have Android Studio installed, make sure `$ANDROID_NDK` is available.
`ANDROID_NDK=/Users/username/Library/Android/sdk/ndk/<version>` for instance.

If the NDK is not installed, you can install it via Android Studio by going to the menu _File > Project Structure_

And then the _SDK Location_ section. It will show you the NDK path, or the option to download it if you don't have it installed.

### Proguard

If you're using Proguard, make sure to add the following rule at `proguard-rules.pro`:

```
-keep class com.shopify.reactnative.skia.** { *; }
```

### TroubleShooting

For error **_CMake 'X.X.X' was not found in SDK, PATH, or by cmake.dir property._**

open _Tools > SDK Manager_, switch to the _SDK Tools_ tab.
Find `CMake` and click _Show Package Details_ and download compatiable version **'X.X.X'**, and apply to install.

## Web

To use this library in the browser, see [these instructions](/docs/getting-started/web).

## Playground

We have an example project you can play with [here](https://github.com/Shopify/react-native-skia/tree/main/example).

```sh
yarn bootstrap
cd example && yarn start
```

To run the example project on iOS, you will need to run `pod install`, and on Android, you will also need Android NDK to be installed ([see here](#android)).

## Debugging

As the library uses JSI for synchronous native methods access, remote debugging is no longer possible. You can use [Flipper](https://fbflipper.com) for debugging your JS code, however, connecting the debugger to the JS context.
There is also an [React Native VSCode extension](https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native#debugging-react-native-applications) that can provide a great debugging experience when using React Native Skia.

## Testing with Jest

React Native Skia test mocks use a web implementation that depends on loading CanvasKit.

The very first step is to make sure that your Skia files are not being transformed by jest, for instance, we can add it the `transformIgnorePatterns` directive:
```js
"transformIgnorePatterns": [
  "node_modules/(?!(react-native|react-native.*|@react-native.*|@?react-navigation.*|@shopify/react-native-skia)/)"
]
```

Next, we recommend using [ESM](https://jestjs.io/docs/ecmascript-modules). To enable ESM support, you need to update your `jest` command to `node --experimental-vm-modules node_modules/.bin/jest`.
But we also support [CommonJS](#commonjs-setup).

### ESM Setup

To load CanvasKit and subsequently the React Native Skia mock, add the following setup file to your Jest configuration:

```js
// notice the extension: .mjs
"setupFiles": ["@shopify/react-native-skia/jestSetup.mjs"]
```

### CommonJS Setup

We also offer a version of the setup file without ECMAScript modules support. To use this version, add the following setup file to your Jest configuration:

```js
// notice the extension: .js
"setupFiles": ["@shopify/react-native-skia/jestSetup.js"]
```

With this setup, you need to load the Skia environment in your test. Include the following at the top of your test file:

```js
/**
 * @jest-environment @shopify/react-native-skia/jestEnv.mjs
 */
```

For instance:

```js
/**
 * @jest-environment @shopify/react-native-skia/jestEnv.mjs
 */
import "react-native";
import React from "react";
import { cleanup, render } from "@testing-library/react-native";
import App from "./App";

it("renders correctly", () => {
  render(<App />);
});

afterEach(cleanup);
```

With this configuration, you will have properly set up Jest to work with React Native Skia mocks using either ECMAScript Modules or CommonJS.
