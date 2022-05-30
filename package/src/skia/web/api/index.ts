import type { CanvasKit } from "canvaskit-wasm";

import { JsiSkPaint } from "./JsiSkPaint";
import { JsiSkRect } from "./JsiSkRect";
import { Color } from "./JsiSkColor";
import { JsiSkSurfaceFactory } from "./JsiSkSurfaceFactory";

export const JsiSkApi = (CanvasKit: CanvasKit) => ({
  Paint: () => new JsiSkPaint(CanvasKit, new CanvasKit.Paint()),
  XYWHRect: (x: number, y: number, width: number, height: number) => {
    return new JsiSkRect(CanvasKit, CanvasKit.XYWHRect(x, y, width, height));
  },
  Color: Color.bind(null, CanvasKit),
  Surface: new JsiSkSurfaceFactory(CanvasKit),
});
