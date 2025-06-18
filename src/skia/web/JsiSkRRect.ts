import type { CanvasKit, RRect } from "canvaskit-wasm";

import type { InputRRect, SkRect, SkRRect } from "../types";

import { BaseHostObject } from "./Host";
import { JsiSkRect } from "./JsiSkRect";

export class JsiSkRRect
  extends BaseHostObject<RRect, "RRect">
  implements SkRRect
{
  dispose = () => {
    // Float32Array
  };

  static fromValue(CanvasKit: CanvasKit, rect: InputRRect) {
    if (rect instanceof JsiSkRect) {
      return rect.ref;
    }
    if (
      "topLeft" in rect &&
      "topRight" in rect &&
      "bottomRight" in rect &&
      "bottomLeft" in rect
    ) {
      return Float32Array.of(
        rect.rect.x,
        rect.rect.y,
        rect.rect.x + rect.rect.width,
        rect.rect.y + rect.rect.height,
        rect.topLeft.x,
        rect.topLeft.y,
        rect.topRight.x,
        rect.topRight.y,
        rect.bottomRight.x,
        rect.bottomRight.y,
        rect.bottomLeft.x,
        rect.bottomLeft.y
      );
    }
    return CanvasKit.RRectXY(
      JsiSkRect.fromValue(CanvasKit, rect.rect),
      rect.rx,
      rect.ry
    );
  }

  constructor(CanvasKit: CanvasKit, rect: SkRect, rx: number, ry: number) {
    // based on https://github.com/google/skia/blob/main/src/core/SkRRect.cpp#L51
    if (rx === Infinity || ry === Infinity) {
      rx = ry = 0;
    }
    if (rect.width < rx + rx || rect.height < ry + ry) {
      // At most one of these two divides will be by zero, and neither numerator is zero.
      const scale = Math.min(rect.width / (rx + rx), rect.height / (ry + ry));
      rx *= scale;
      ry *= scale;
    }
    const ref = CanvasKit.RRectXY(JsiSkRect.fromValue(CanvasKit, rect), rx, ry);
    super(CanvasKit, ref, "RRect");
  }

  get rx() {
    return this.ref[4];
  }

  get ry() {
    return this.ref[5];
  }

  get rect() {
    return new JsiSkRect(
      this.CanvasKit,
      Float32Array.of(this.ref[0], this.ref[1], this.ref[2], this.ref[3])
    );
  }
}
