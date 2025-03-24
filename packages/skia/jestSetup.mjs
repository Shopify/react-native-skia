/* eslint-disable import/no-extraneous-dependencies */
import { jest } from "@jest/globals";
import CanvasKitInit from "canvaskit-wasm/bin/full/canvaskit";
import { Mock } from "@exodus/react-native-skia/lib/mock";

global.CanvasKit = await CanvasKitInit({});

jest.mock("@exodus/react-native-skia", () => {
  jest.mock("@exodus/react-native-skia/lib/Platform", () => {
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
  jest.mock("@exodus/react-native-skia/lib/skia/core/Font", () => {
    return {
      useFont: () => null,
      matchFont: () => null,
      listFontFamilies: () => [],
      useFonts: () => null,
    }
  });
  return Mock(global.CanvasKit);
});
