import type { CanvasKit } from "canvaskit-wasm";

import { JsiSkApi } from "../skia/web";
import { ValueApi } from "../values/web";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Noop: () => any = () => undefined;
const NoopValue = () => ({ current: 0 });

export const Mock = (CanvasKit: CanvasKit) => {
  global.SkiaApi = JsiSkApi(CanvasKit);
  global.SkiaValueApi = ValueApi;
  const Skia = global.SkiaApi;
  return {
    Skia,
    ...require("../renderer/components"),
    ...require("../skia"),
    ...require("../values"),
    ...require("../animation"),
    ...require("../dom/types"),
    ...require("../dom/nodes"),
    // We could use the real Canvas if we mock the SkiaView component for node
    Canvas: Noop,
    useValue: NoopValue,
    useComputedValue: NoopValue,
    useTouchHandler: Noop,
    useTiming: NoopValue,
    useLoop: NoopValue,
    useSpring: NoopValue,
    useRawData: Noop,
    useData: Noop,
    useFont: Noop,
    useTypeface: Noop,
    useImage: Noop,
    useSVG: Noop,
  };
};
