import type { CanvasKit, RRect } from "canvaskit-wasm";

import type { SkRRect } from "../types";

import { HostObject } from "./Host";
import { JsiSkRect } from "./JsiSkRect";

export class JsiSkRRect extends HostObject<RRect, "RRect"> implements SkRRect {
  constructor(CanvasKit: CanvasKit, ref: RRect) {
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
