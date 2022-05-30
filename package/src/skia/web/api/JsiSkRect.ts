import type { CanvasKit, Rect } from "canvaskit-wasm";

import type { SkRect } from "../../types";

import { HostObject } from "./Host";

export class JsiSkRect extends HostObject<Rect, "Rect"> implements SkRect {
  constructor(CanvasKit: CanvasKit, ref: Rect) {
    super(CanvasKit, ref, "Rect");
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
