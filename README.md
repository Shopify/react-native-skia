# @shopify/react-native-skia

## Getting started

`yarn add @shopify/react-native-skia`

`npx pod-install example/ios`

## Library Development

To develop react-native-skia, you need to build the skia libraries on your computer.

Make sure to check out the sub modules:

`git submodule update --init --recursive`

You also need to install some tools for the build scripts to work. Run `yarn` in the root of the project to install them.

Make sure you have all the tools required for building the skia libraries (XCode, CMake, Android NDK / build tools)

### Building

- Build the Skia libraries with `yarn build-skia`.
- Copy Skia headers to the packages/cpp/skia/include folder `yarn copy-skia-headers`
