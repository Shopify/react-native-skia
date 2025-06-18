import type { CanvasKit, Paragraph } from "canvaskit-wasm";
import type { SkRect, SkRectWithDirection, SkParagraph } from "../types";
import { HostObject } from "./Host";
import type { JsiSkCanvas } from "./JsiSkCanvas";
export declare class JsiSkParagraph extends HostObject<Paragraph, "Paragraph"> implements SkParagraph {
    constructor(CanvasKit: CanvasKit, ref: Paragraph);
    getMinIntrinsicWidth(): number;
    getMaxIntrinsicWidth(): number;
    getLongestLine(): number;
    layout(width: number): void;
    paint(canvas: JsiSkCanvas, x: number, y: number): void;
    getHeight(): number;
    getMaxWidth(): number;
    getGlyphPositionAtCoordinate(x: number, y: number): number;
    getRectsForPlaceholders(): SkRectWithDirection[];
    getRectsForRange(start: number, end: number): SkRect[];
    getLineMetrics(): SkRect[];
    dispose(): void;
}
