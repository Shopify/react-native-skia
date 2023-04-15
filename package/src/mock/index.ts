import type { CanvasKit } from "canvaskit-wasm";

import { JsiSkApi } from "../skia/web";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Noop: () => any = () => undefined;

export const Mock = (CanvasKit: CanvasKit) => {
  global.SkiaApi = JsiSkApi(CanvasKit);
  const Skia = global.SkiaApi;
  return {
    Skia,
    ...require("../renderer/components"),
    ...require("../skia"),
    ...require("../values"),
    ...require("../animation"),
    ...require("../dom/types"),
    ...require("../dom/nodes"),
    useRawData: Noop,
    useData: Noop,
    useFont: Noop,
    useTypeface: Noop,
    useImage: Noop,
    useSVG: Noop,
  };
};
