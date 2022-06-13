import type { CanvasKit, ContourMeasure } from "canvaskit-wasm";

import type { SkContourMeasure } from "../types";

import { HostObject } from "./Host";
import { JsiSkPath } from "./JsiSkPath";

export class JsiSkContourMeasure
  extends HostObject<ContourMeasure, "ContourMeasure">
  implements SkContourMeasure
{
  constructor(CanvasKit: CanvasKit, ref: ContourMeasure) {
    super(CanvasKit, ref, "ContourMeasure");
  }

  getPosTan(distance: number) {
    const [px, py, tx, ty] = this.ref.getPosTan(distance);
    return { px, py, tx, ty };
  }

  getSegment(startD: number, stopD: number, startWithMoveTo: boolean) {
    return new JsiSkPath(
      this.CanvasKit,
      this.ref.getSegment(startD, stopD, startWithMoveTo)
    );
  }

  isClosed() {
    return this.ref.isClosed();
  }

  length() {
    return this.ref.length();
  }
}
