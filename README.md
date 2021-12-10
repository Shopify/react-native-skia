# @shopify/react-native-skia

https://shopify.github.io/react-native-skia

React Native Skia brings the Skia Graphics Library to React Native. Skia serves as the graphics engine for Google Chrome and Chrome OS, Android, Flutter, Mozilla Firefox and, Firefox OS, and many other products.

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

### Building

- Install dependencies in the root project `yarn`
- Install dependencies in the root project `cd package && yarn && cd ..`
- Install dependencies in the example `cd example && yarn && cd ..`
- Build the Skia libraries with `yarn build-skia` (this can take a while)
- Copy Skia headers `yarn copy-skia-headers`
- Run pod install in the example project
