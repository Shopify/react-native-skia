/* globals jest */
jest.mock("@exodus/react-native-skia", () => {
  jest.mock("@exodus/react-native-skia/lib/commonjs/Platform", () => {
    const Noop = () => undefined;
    return {
      OS: "web",
      PixelRatio: 1,
      requireNativeComponent: Noop,
      resolveAsset: Noop,
      findNodeHandle: Noop,
      NativeModules: Noop,
      View: Noop,
    };
  });
  jest.mock("@exodus/react-native-skia/lib/commonjs/skia/core/Font", () => {
    return {
      useFont: () => null,
      matchFont: () => null,
      listFontFamilies: () => [],
      useFonts: () => null,
    }
  });
  return require("@exodus/react-native-skia/lib/commonjs/mock").Mock(
    global.CanvasKit
  );
});
