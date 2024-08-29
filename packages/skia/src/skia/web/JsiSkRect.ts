import type { CanvasKit, Rect } from "canvaskit-wasm";

import type { SkHostRect, SkRect } from "../types";

import { BaseHostObject } from "./Host";

export class JsiSkRect
  extends BaseHostObject<Rect, "Rect">
  implements SkHostRect
{
  static fromValue(CanvasKit: CanvasKit, rect: SkRect) {
    if (rect instanceof JsiSkRect) {
      return rect.ref;
    }
    return CanvasKit.XYWHRect(rect.x, rect.y, rect.width, rect.height);
  }

  dispose = () => {
    // Float32Array
  };

  constructor(CanvasKit: CanvasKit, ref: Rect) {
    super(CanvasKit, ref, "Rect");
  }

  setXYWH(x: number, y: number, width: number, height: number): void {
    this.ref[0] = x;
    this.ref[1] = y;
    this.ref[2] = x + width;
    this.ref[3] = y + height;
  }

  get x() {
    return this.ref[0];
  }

  get y() {
    return this.ref[1];
  }

  get width() {
    return this.ref[2] - this.ref[0];
  }

  get height() {
    return this.ref[3] - this.ref[1];
  }
}
