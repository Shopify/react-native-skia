import type { CanvasKit, ContourMeasureIter } from "canvaskit-wasm";

import type { SkContourMeasureIter } from "../types/ContourMeasure";

import { HostObject } from "./Host";
import { JsiSkContourMeasure } from "./JsiSkContourMeasure";

export class JsiSkContourMeasureIter
  extends HostObject<ContourMeasureIter, "ContourMeasureIter">
  implements SkContourMeasureIter
{
  constructor(CanvasKit: CanvasKit, ref: ContourMeasureIter) {
    super(CanvasKit, ref, "ContourMeasureIter");
  }

  next() {
    const result = this.ref.next();
    if (result === null) {
      return null;
    }
    return new JsiSkContourMeasure(this.CanvasKit, result);
  }

  dispose = () => {
    this.ref.delete();
  };
}
