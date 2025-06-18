export class JsiSkParagraph extends HostObject {
    constructor(CanvasKit: any, ref: any);
    getMinIntrinsicWidth(): any;
    getMaxIntrinsicWidth(): any;
    getLongestLine(): any;
    layout(width: any): void;
    paint(canvas: any, x: any, y: any): void;
    getHeight(): any;
    getMaxWidth(): any;
    getGlyphPositionAtCoordinate(x: any, y: any): any;
    getRectsForPlaceholders(): any;
    getRectsForRange(start: any, end: any): any;
    getLineMetrics(): any;
    dispose(): void;
}
import { HostObject } from "./Host";
