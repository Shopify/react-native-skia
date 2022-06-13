import type { CanvasKit, Point } from "canvaskit-wasm";

import type { SkPoint } from "../types";

import { HostObject } from "./Host";

export class JsiSkPoint extends HostObject<Point, "Point"> implements SkPoint {
  constructor(CanvasKit: CanvasKit, ref: Point) {
    super(CanvasKit, ref, "Point");
  }

  get x() {
    return this.ref[0];
  }

  get y() {
    return this.ref[1];
  }
}
