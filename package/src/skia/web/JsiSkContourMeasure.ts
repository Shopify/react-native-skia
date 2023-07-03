import type { CanvasKit, ContourMeasure } from "canvaskit-wasm";

import type { SkContourMeasure } from "../types";

import { HostObject } from "./Host";
import { JsiSkPath } from "./JsiSkPath";
import { JsiSkPoint } from "./JsiSkPoint";

export class JsiSkContourMeasure
  extends HostObject<ContourMeasure, "ContourMeasure">
  implements SkContourMeasure
{
  constructor(CanvasKit: CanvasKit, ref: ContourMeasure) {
    super(CanvasKit, ref, "ContourMeasure");
  }

  getPosTan(distance: number): [position: JsiSkPoint, tangent: JsiSkPoint] {
    const posTan = this.ref.getPosTan(distance);
    return [
      new JsiSkPoint(this.CanvasKit, posTan.slice(0, 2)),
      new JsiSkPoint(this.CanvasKit, posTan.slice(2)),
    ];
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

  dispose = () => {
    this.ref.delete();
  };
}
