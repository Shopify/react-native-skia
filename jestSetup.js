/* globals jest */
jest.mock("@shopify/react-native-skia", () => {
  jest.mock("@shopify/react-native-skia/lib/commonjs/Platform", () => {
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
  return require("@shopify/react-native-skia/lib/commonjs/mock").Mock(
    global.CanvasKit
  );
});
