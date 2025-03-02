# React Native Skia

High-performance 2d Graphics for React Native using Skia

[![CI](https://github.com/Shopify/react-native-skia/actions/workflows/ci.yml/badge.svg)](https://github.com/Shopify/react-native-skia/actions/workflows/tests.yml)
[![npm version](https://img.shields.io/npm/v/@shopify/react-native-skia.svg?style=flat)](https://www.npmjs.com/package/@shopify/react-native-skia)
[![issues](https://img.shields.io/github/issues/shopify/react-native-skia.svg?style=flat)](https://github.com/shopify/react-native-skia/issues)

<img width="400" alt="skia" src="https://user-images.githubusercontent.com/306134/146549218-b7959ad9-0107-4c1c-b439-b96c780f5230.png">

Checkout the full documentation [here](https://shopify.github.io/react-native-skia).

React Native Skia brings the Skia Graphics Library to React Native. Skia serves as the graphics engine for Google Chrome and Chrome OS, Android, Flutter, Mozilla Firefox and Firefox OS, and many other products.

## Getting Started

[Installation instructions](https://shopify.github.io/react-native-skia/docs/getting-started/installation/)

## Library Development

To develop react-native-skia, you need to build the skia libraries on your computer.

If you have Android Studio installed, make sure `$ANDROID_NDK` is available.
`ANDROID_NDK=/Users/username/Library/Android/sdk/ndk/<version>` for instance.
If the NDK is not installed, you can install it via Android Studio by going to the menu _File > Project Structure_.
And then the _SDK Location_ section. It will show you the NDK path, or the option to Download it if you don't have it installed.

### Building

- Checkout submodules `git submodule update --init --recursive`
- Install dependencies `yarn`
- Go to the package folder `cd packages/skia`
- Build the Skia libraries with `yarn build-skia` (this can take a while)
- Copy Skia headers `yarn copy-skia-headers`
- run `yarn pod:install`

### Upgrading

If a new version of Skia is included in an upgrade of this library, you need to perform a few extra steps before continuing:

1. Update submodules: `git submodule update --recursive --remote`
2. Clean Skia: `yarn clean-skia`
3. Build Skia: `yarn build-skia`
4. Copy Skia Headers: `yarn copy-skia-headers`
5. Run pod install in the example project

### Publishing

- Run the commands in the [Building](#building) section
- Build the Android binaries with `yarn build-skia-android`
- Build the NPM package with `yarn build-npm`

Publish the NPM package manually. The output is found in the `dist` folder.

- Install Cocoapods in the example/ios folder `cd example/ios && pod install && cd ..`

## Contributing

When making contributions to the project, an important part is testing.
In the `package` folder, we have several scripts set up to help you maintain the quality of the codebase and test your changes:

- `yarn lint` — Lints the code for potential errors and to ensure consistency with our coding standards.
- `yarn tsc` — Runs the TypeScript compiler to check for typing issues.
- `yarn test` — Executes the unit tests to ensure existing features work as expected after changes.
- `yarn e2e` — Runs end-to-end tests. For these tests to run properly, you need to have the example app running. Use `yarn ios` or `yarn android` in the `example` folder and navigate to the Tests screen within the app.

## Running End-to-End Tests

To ensure the best reliability, we encourage running end-to-end tests before submitting your changes:

1. Start the example app:
```sh
cd example
yarn ios # or yarn android for Android testing
```

Once the app is open in your simulator or device, press the "Tests" item at the bottom of the list.
   
2. With the example app running and the Tests screen open, run the following command in the `package` folder:
```sh
yarn e2e
```
   
This will run through the automated tests and verify that your changes have not introduced any regressions.
You can also run a particular using the following command:
```sh
E2E=true yarn test -i e2e/Colors
```

### Writing End-to-End Tests

Contributing end-to-end tests to React Native Skia is extremely useful. Below you'll find guidelines for writing tests using the `eval`, `draw`, and `drawOffscreen` commands. 

e2e tests are located in the `package/__tests__/e2e/` directory. You can create a file there or add a new test to an existing file depending on what is most sensible.
When looking to contribute a new test, you can refer to existing tests to see how these can be built.
The `eval` command is used to test Skia's imperative API. It requires a pure function that invokes Skia operations and returns a serialized result.

```tsx
it("should generate commands properly", async () => {
  const result = await surface.eval((Skia) => {
    const path = Skia.Path.Make();
    path.lineTo(30, 30);
    return path.toCmds();
  });
  expect(result).toEqual([[0, 0, 0], [1, 30, 30]]);
});
```

Both the `eval` and `draw` commands require a function that will be executed in an isolated context, so the functions must be pure (without external dependencies) and serializable. You can use the second parameter to provide extra data to that function.

```tsx
it("should generate commands properly", async () => {
  // Referencing the SVG variable directly in the tests would fail
  // as the function wouldn't be able to run in an isolated context
  const svg = "M 0 0, L 30 30";
  const result = await surface.eval((Skia, ctx) => {
    const path = Skia.Path.MakeFromSVGString(ctx.svg);
    return path.toCmds();
  }, { svg });
  expect(result).toEqual([[0, 0, 0], [1, 30, 30]]);
});
```

A second option is to use the `draw` command where you can test the Skia components and get the resulting image:
```tsx
it("Path with default fillType", async () => {
  const { Skia } = importSkia();
  const path = star(Skia);
  const img = await surface.draw(
    <>
      <Fill color="white" />
      <Path path={path} style="stroke" strokeWidth={4} color="#3EB489" />
      <Path path={path} color="lightblue" />
    </>
  );
  checkImage(image, "snapshots/drawings/path.png");
});
```

Finally, you can use `drawOffscreen` to receive a canvas object as parameter. You will also get the resulting image:

```tsx
  it("Should draw cyan", async () => {
    const image = await surface.drawOffscreen(
      (Skia, canvas, { size }) => {
        canvas.drawColor(Skia.Color("cyan"));
      }
    );
    checkImage(image, "snapshots/cyan.png");
  });
```

Again, since `eval`, `draw`, and `drawOffscreen` serialize the function's content, avoid any external dependencies that can't be serialized.

## Graphite

Skia has two backends: Ganesh and Graphite. Ganesh is the default backend.
Currently, Graphite doesn't match Ganesh in terms of features, but we offer experimental support for it.  
If you want to tinker with Graphite, you can enable it by building Skia using `SK_GRAPHITE=1 yarn build-skia`.  
With this command, the Skia binary will work for both Ganesh and Graphite.  
The reason we do not currently ship this build by default is that it requires Android API Level 26 or above.

To enable Graphite in your app, follow these steps:  
* **iOS**: Install pods using `SK_GRAPHITE=1 pod install`.  
* **Android**: In [CMakeLists.txt](/packages/skia/android/CMakeLists.txt), use `set(SK_GRAPHITE ON)`.
  
