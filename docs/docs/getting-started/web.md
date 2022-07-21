---
id: web
title: Web Support
sidebar_label: Web
slug: /getting-started/web
---

React Native Skia runs in a web browser thanks to [CanvasKit](https://skia.org/docs/user/modules/canvaskit/), a WebAssembly build of Skia.
The WebAssembly file is loaded asynchronously and has a size of 7.9MB.
While this is a subtancial file size, you have control over the user-experience: you can decide when to load Skia and how the loading should look like to the user.

We provide direct integrations with [Expo](#Expo) and [Remotion](#Remotion).
Below you will also find the manual installation steps to run the module on any React Native Web projects.

## Expo

Using React Native Skia on Expo web is fairly straightforward.
We provide a script that will well with the setup:
```bash
$ expo install @shopify/react-native-skia
$ yarn setup-skia-web
```

Once you are done you need to pick your strategy to [Load Skia](#loading-skia).
If you are not using `react-native-reanimated`, you can get rid of a webpack warning [here](#manual-webpack-installation).

## Remotion

To use React Native Skia with Remotion please follow [the following installation steps](https://remotion.dev/skia).

## Manual Webpack Installation

To run React Native Skia on Web you need to do three things:
* Make sure that WebAssembly file is available from the build system. This can easily be done using the [webpack copy plugin](https://webpack.js.org/plugins/copy-webpack-plugin/).
* Configure the build system to resolve the following two node modules: `fs` and `path`. One way to do it is to use the [node polyfill plugin](https://www.npmjs.com/package/node-polyfill-webpack-plugin).
* If you are not using the `react-native-reanimated`, Webpack will throw a warning since React Native Skia refers to that module.

So following is an example of Webpack v5 configuration that supports React Native Skia.
These three steps can easily be adapted to your own build system.

```tsx
import CopyPlugin from "copy-webpack-plugin";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

const newConfiguration = {
  ...currentConfiguration,
  plugins: [
    ...currentConfiguration.plugins,
    // 1. Make the wasm file available to the build system
    new CopyPlugin({
      patterns: [
        {
          from: "node_modules/canvaskit-wasm/bin/full/canvaskit.wasm",
        },
      ],
    }),
    // 2. Polyfill fs and path module
    new NodePolyfillPlugin()
  ],
  externals: {
    ...currentConfiguration.externals,
    // 3. Avoid warning if reanimated is not present
    "react-native-reanimated": "require('react-native-reanimated')",
    "react-native-reanimated/lib/reanimated2/core":
      "require('react-native-reanimated/lib/reanimated2/core')",
  },
}
```

Last but not least, you need to [load Skia](#unsupported-features).

## Loading Skia

you need to have Skia fully loaded and initialized before importing the Skia module.
There are two ways you can control the way Skia should load:
* With `<WithSkia />`: using code-splitting to defer the loading of the components that import Skia.
* With `LoadSkia()`: by defering the root component registration, until Skia is loaded.

### Using Code-Splitting

We provide a `<WithSkia>` component which leverages [code splitting](https://reactjs.org/docs/code-splitting.html). In the example below, we load Skia before loadig the `MySkiaComponent` component. 

```tsx
import React from 'react';
import { Text } from "react-native";
// Notice the import path `@shopify/react-native-skia/lib/module/web`
// This is important to only pull the code responsible to load Skia.
// @ts-expect-error
import { WithSkia } from "@shopify/react-native-skia/lib/module/web";

export default function App() {
  return (
    <WithSkia
      fallback={() => import("./MySkiaComponent")}
      getComponent={<Text>Loading Skia...</Text>} />
  );
}
```

### Using Defered Component Registration

We provide a `LoadSkia()` function you can use to load Skia before starting the React app.
This the approach we use for Remotion for instance.
The following is an example of an `index.web.js` file.

```tsx
// Notice the import path `@shopify/react-native-skia/lib/module/web`
// This is important to only pull the code responsible to load Skia.
// @ts-expect-error
import { LoadSkia } from "@shopify/react-native-skia/lib/module/web";

// This is only needed on React Native Web
LoadSkia().then(async () => {
  const App = (await import("./src/App")).default;
  AppRegistry.registerComponent("Example", () => App);
});
```

## Unsupported Features

Below are the React Native Skia APIs which are not yet supported on React Native Web.
Some of these non features are a work in progress and some other features will come later.

**Work in Progress**

* `ColorFilter::MakeLuma`
* `ImageFilter::MakeBlend`
* `ImageFilter::MakeDilate`
* `ImageFilter::MakeErode`
* `ImageFilter::MakeDropShadowOnly`
* `ImageFilter::MakeDropShadow`
* `ImageFilter::MakeDisplacementMap`
* `ImageFilter::MakeOffset`

**Coming soon**

* `Font::GetPath`
* `ImageFilter::MakeShader`
* `ShaderFilter`

**Unplanned**

* `ImageSvg`
