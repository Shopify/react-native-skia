import type { CanvasKit, ContourMeasure } from "canvaskit-wasm";
import type { SkContourMeasure } from "../types";
import { HostObject } from "./Host";
import { JsiSkPath } from "./JsiSkPath";
import { JsiSkPoint } from "./JsiSkPoint";
export declare class JsiSkContourMeasure extends HostObject<ContourMeasure, "ContourMeasure"> implements SkContourMeasure {
    constructor(CanvasKit: CanvasKit, ref: ContourMeasure);
    getPosTan(distance: number): [position: JsiSkPoint, tangent: JsiSkPoint];
    getSegment(startD: number, stopD: number, startWithMoveTo: boolean): JsiSkPath;
    isClosed(): boolean;
    length(): number;
    dispose: () => void;
}
