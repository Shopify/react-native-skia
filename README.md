# @shopify/react-native-skia

## Library Development

To develop react-native-skia, you need to build the skia libraries on your computer.

Make sure to check out the sub modules:

`git submodule update --init --recursive`

You also need to install some tools for the build scripts to work. Run `yarn` in the root of the project to install them.

Make sure you have all the tools required for building the skia libraries (XCode, Ninja, CMake, Android NDK / build tools)

### Building

- Install dependencies in the root project `yarn`
- Install dependencies in the root project `cd package && yarn && cd ..`
- Install dependencies in the example `cd example && yarn && cd ..`
- Build the Skia libraries with `yarn build-skia` (this can take a while)
- Copy Skia headers `yarn copy-skia-headers`
- Run pod install in the example project
