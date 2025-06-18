export class JsiSkContourMeasure extends HostObject {
    constructor(CanvasKit: any, ref: any);
    getPosTan(distance: any): JsiSkPoint[];
    getSegment(startD: any, stopD: any, startWithMoveTo: any): JsiSkPath;
    isClosed(): any;
    length(): any;
}
import { HostObject } from "./Host";
import { JsiSkPoint } from "./JsiSkPoint";
import { JsiSkPath } from "./JsiSkPath";
