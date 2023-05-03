import type { CanvasKit } from "canvaskit-wasm";

import { JsiSkApi } from "../skia/web";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Noop: () => any = () => undefined;

export const Mock = (CanvasKit: CanvasKit) => {
  global.SkiaApi = JsiSkApi(CanvasKit);
  //  global.SkiaValueApi = ValueApi;
  // console.log(global.SkiaValueApi);
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
    useComputedValue: Noop,
    useTouchHandler: Noop,
    useTiming: Noop,
    useLoop: Noop,
    useSpring: Noop,
    useRawData: Noop,
    useData: Noop,
    useFont: Noop,
    useTypeface: Noop,
    useImage: Noop,
    useSVG: Noop,
  };
};
