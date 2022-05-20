import type { Canvas, CanvasKit, Paint, Rect } from "canvaskit-wasm";

import type { SkRect } from "../../Rect";
import type { SkPaint } from "../../Paint";
import type { SkCanvas } from "../../Canvas";

import { HostObject, toValue } from "./Host";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export class JsiSkCanvas
  extends HostObject<Canvas, "Canvas">
  implements SkCanvas
{
  constructor(CanvasKit: CanvasKit, ref: Canvas) {
    super(CanvasKit, ref, "Canvas");
  }

  drawRect(rect: SkRect, paint: SkPaint) {
    this.ref.drawRect(toValue<Rect>(rect), toValue<Paint>(paint));
  }
}
