# @shopify/react-native-skia

<img width="400" alt="skia" src="https://user-images.githubusercontent.com/306134/146549218-b7959ad9-0107-4c1c-b439-b96c780f5230.png">

Checkout the full documentation [here](https://shopify.github.io/react-native-skia).

React Native Skia brings the Skia Graphics Library to React Native. Skia serves as the graphics engine for Google Chrome and Chrome OS, Android, Flutter, Mozilla Firefox and, Firefox OS, and many other products.

*This is an alpha release. Use with caution.*

## Installation

React Native Skia brings the [Skia Graphics Library](https://skia.org/) to React Native.
Skia serves as the graphics engine for Google Chrome and Chrome OS, Android, Flutter, Mozilla Firefox and, Firefox OS, and many other products.

When reading these lines, the package is not yet available on npm.
Use the link below to install the package.

```sh
$ yarn add https://github.com/Shopify/react-native-skia/releases/download/v0.1.43-alpha/shopify-react-native-skia-0.1.43.tgz
```

Or using npm:

```sh
$ npm install https://github.com/Shopify/react-native-skia/releases/download/v0.1.43-alpha/shopify-react-native-skia-0.1.43.tgz
```

### iOS

Run `pod install` on the `ios/` directory.

You will need to disable Bitcode in order to create a release build: `Build Settings > Build Options > Enable Bitcode -> Release -> No`. In Expo managed apps, set `ios.bitcode` to `false` in `app.json`.

### Android

> **Version compatibility**: `react-native@>=66` is required.

Currently, you will need Android NDK to be installed.
If you have Android Studio installed, make sure `$ANDROID_NDK` is available.
`ANDROID_NDK=/Users/username/Library/Android/sdk/ndk-bundle` for instance.

If the NDK is not installed, you can install it via Android Studio by going to the menu _File > Project Structure_

And then the _SDK Location_ section. It will show you the NDK path, or the option to Download it if you don't have it installed.

### Playground

We have an example project you can play with [here](https://github.com/Shopify/react-native-skia/tree/main/example).

```sh
$ yarn
$ cd package && yarn && cd ..
$ cd example && yarn && yarn start
```

To run the example project on iOS, you will need to run `pod install` and on Android you will also need Android NDK to be installed ([see here](#android)).

## Hello World


React Native Skia has two APIs: a declarative API available as a React Native Renderer and an imperative API backed by JSI.
The recommended way to use this library is via the declarative API.
Library developers may take advantage of the imperative API to provide custom features.

## Declarative API

### Example

```tsx twoslash
import {Canvas, Circle, Group} from "@shopify/react-native-skia";

export const HelloWorld = () => {
  const width = 256;
  const height = 256;
  const r = 215;
  return (
    <Canvas style={{ flex: 1 }}>
      <Group blendMode="multiply">
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={width - r} cy={r} r={r} color="magenta" />
        <Circle
          cx={width/2}
          cy={height - r}
          r={r}
          color="yellow"
        />
      </Group>
    </Canvas>
  );
};
```

## Imperative API

### Example

```tsx twoslash
import {Skia, BlendMode, SkiaView, useDrawCallback} from "@shopify/react-native-skia";

const paint = Skia.Paint();
paint.setAntiAlias(true);
paint.setBlendMode(BlendMode.Multiply);

export const HelloWorld = () => {
  const width = 256;
  const height = 256;
  const r = 215;
  const onDraw = useDrawCallback((canvas) => {
    // Cyan Circle
    const cyan = paint.copy();
    cyan.setColor(Skia.Color("cyan"));
    canvas.drawCircle(r, r, r, cyan);
    // Magenta Circle
    const magenta = paint.copy();
    magenta.setColor(Skia.Color("magenta"));
    canvas.drawCircle(width - r, r, r, magenta);
    // Yellow Circle
    const yellow = paint.copy();
    yellow.setColor(Skia.Color("yellow"));
    canvas.drawCircle(width/2, height - r, r, yellow);
  });
  return (
    <SkiaView style={{ flex: 1 }} onDraw={onDraw} />
  );
};
```

## Library Development

To develop react-native-skia, you need to build the skia libraries on your computer.

Make sure to check out the sub modules:

`git submodule update --init --recursive`

You also need to install some tools for the build scripts to work. Run `yarn` in the root of the project to install them.

Make sure you have all the tools required for building the skia libraries (XCode, Ninja, CMake, Android NDK / build tools)

On MacOS you can install Ninja via homebrew:

```sh
brew install ninja
```

If you have Android Studio installed, make sure `$ANDROID_NDK` is available.
`ANDROID_NDK=/Users/username/Library/Android/sdk/ndk-bundle` for instance.

If the NDK is not installed, you can install it via Android Studio by going to the menu _File > Project Structure_

And then the _SDK Location_ section. It will show you the NDK path, or the option to Download it if you don't have it installed.

### Building

- Install dependencies in the root project `yarn`
- Install dependencies in the root project `cd package && yarn && cd ..`
- Install dependencies in the example `cd example && yarn && cd ..`
- Build the Skia libraries with `yarn build-skia` (this can take a while)
- Copy Skia headers `yarn copy-skia-headers`
- Run pod install in the example project

### Publishing

- Run the commands in the `Building` section
- Build the Android binaries with `yarn build-android`
- Build the NPM package with `yarn build-npm';

Publish the NPM package manually. The output is found in the `dist` folder.

- Install Cocoapods in the example/ios folder `cd example/ios && pod install && cd ..`
