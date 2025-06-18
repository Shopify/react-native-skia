import type { CanvasKit, ContourMeasureIter } from "canvaskit-wasm";
import type { SkContourMeasureIter } from "../types/ContourMeasure";
import { HostObject } from "./Host";
import { JsiSkContourMeasure } from "./JsiSkContourMeasure";
export declare class JsiSkContourMeasureIter extends HostObject<ContourMeasureIter, "ContourMeasureIter"> implements SkContourMeasureIter {
    constructor(CanvasKit: CanvasKit, ref: ContourMeasureIter);
    next(): JsiSkContourMeasure | null;
    dispose: () => void;
}
