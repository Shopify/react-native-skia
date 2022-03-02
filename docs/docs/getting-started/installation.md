---
id: installation
title: Installation
sidebar_label: Installation
slug: /getting-started/installation
---

React Native Skia brings the [Skia Graphics Library](https://skia.org/) to React Native.
Skia serves as the graphics engine for Google Chrome and Chrome OS, Android, Flutter, Mozilla Firefox and, Firefox OS, and many other products.


:::warning

This is an alpha release.
Use with caution.

:::

When reading these lines, the package is not yet available on npm.
Use the link below to install the package.

```sh
yarn add https://github.com/Shopify/react-native-skia/releases/download/v0.1.104-alpha/shopify-react-native-skia-0.1.104.tgz
```

Or using npm:

```sh
npm install https://github.com/Shopify/react-native-skia/releases/download/v0.1.104-alpha/shopify-react-native-skia-0.1.104.tgz
```

## iOS

Run `pod install` on the `ios/` directory.

You will need to disable Bitcode in order to create a release build: `Build Settings > Build Options > Enable Bitcode -> Release -> No`. In Expo managed apps, set `ios.bitcode` to `false` in `app.json`.

## Android

> **Version compatibility**: `react-native@>=0.66` is required.

Currently, you will need Android NDK to be installed.
If you have Android Studio installed, make sure `$ANDROID_NDK` is available.
`ANDROID_NDK=/Users/username/Library/Android/sdk/ndk-bundle` for instance.

If the NDK is not installed, you can install it via Android Studio by going to the menu _File > Project Structure_

And then the _SDK Location_ section. It will show you the NDK path, or the option to Download it if you don't have it installed.

## Playground

We have an example project you can play with [here](https://github.com/Shopify/react-native-skia/tree/main/example).

```sh
yarn
cd package && yarn && cd ..
cd example && yarn && yarn start
```

To run the example project on iOS, you will need to run `pod install` and on Android you will also need Android NDK to be installed ([see here](#android)).
