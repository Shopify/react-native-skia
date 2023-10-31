/* eslint-disable import/no-extraneous-dependencies */
import { jest } from "@jest/globals";
import CanvasKitInit from "canvaskit-wasm/bin/full/canvaskit";

import Mock from "./src/mock";

global.CanvasKit = await CanvasKitInit({});

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
  return Mock.Mock(global.CanvasKit);
});
