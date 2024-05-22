import type { CanvasKit } from "canvaskit-wasm";

import { JsiSkApi } from "../skia/web";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Noop: () => any = () => undefined;
const NoopValue = () => ({ current: 0 });
const NoopSharedValue = () => ({ value: 0 });

export const Mock = (CanvasKit: CanvasKit) => {
  global.SkiaApi = JsiSkApi(CanvasKit);
  const Skia = global.SkiaApi;
  return {
    Skia,
    ...require("../renderer/components"),
    ...require("../skia"),
    ...require("../animation"),
    ...require("../dom/types"),
    ...require("../dom/nodes"),
    // We could use the real Canvas if we mock the SkiaView component for node
    Canvas: Noop,
    // Skia Animations
    useValue: NoopValue,
    useComputedValue: NoopValue,
    useTouchHandler: Noop,
    useTiming: NoopValue,
    useLoop: NoopValue,
    useSpring: NoopValue,
    useClockValue: NoopValue,
    useValueEffect: Noop,
    // Reanimated hooks
    useClock: NoopSharedValue,
    usePathInterpolation: NoopSharedValue,
    useImageAsTexture: NoopSharedValue,
    useTextureValue: NoopSharedValue,
    useTextureValueFromPicture: NoopSharedValue,
    useRSXformBuffer: NoopSharedValue,
    usePointBuffer: NoopSharedValue,
    useColorBuffer: NoopSharedValue,
    useRectBuffer: NoopSharedValue,
    useBuffer: NoopSharedValue,
    useRawData: Noop,
    useData: Noop,
    useFont: () => Skia.Font(undefined, 0),
    useFonts: Noop,
    useTypeface: () => null,
    useImage: () => null,
    useSVG: () => null,
    useVideo: () => null,
  };
};
