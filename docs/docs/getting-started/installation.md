---
id: installation
title: Installation
sidebar_label: Installation
slug: /getting-started/installation
---

React Native Skia brings the [Skia Graphics Library](https://skia.org/) to React Native.
Skia serves as the graphics engine for Google Chrome and Chrome OS, Android, Flutter, Mozilla Firefox and, Firefox OS, and many other products.

```sh
$ yarn add @shopify/react-native-skia
```

Or using npm:

```sh
$ yarn add @shopify/react-native-skia
```

## iOS

Run `pod install` on the `ios/` directory.

## Android

Currently, you will need Android NDK to be installed.
If you have Android Studio installed, make sure `$ANDROID_NDK` is available.
`ANDROID_NDK=/Users/username/Library/Android/sdk/ndk-bundle` for instance.

If the NDK is not installed, you can install it via Android Studio by going to the menu _File > Project Structure_

And then the _SDK Location_ section. It will show you the NDK path, or the option to Download it if you don't have it installed.

## Playground

We have an example project you can play with [here](https://github.com/Shopify/react-native-skia/tree/main/example).

```sh
$ yarn
$ cd package && yarn && cd ..
$ cd example && yarn && yarn start
```

To run the example project on iOS, you will need to run `pod install` and on Android you will also need Android NDK to be installed ([see here](#android)).