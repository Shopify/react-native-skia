import type { SkParagraph, Skia, SkCanvas } from "../../../../skia/types";
import type { EvalContext } from "../../setup";
import { SkiaObject } from "./SkiaObject";
export declare class ParagraphAsset<Ctx extends EvalContext> extends SkiaObject<Ctx, SkParagraph> implements SkParagraph {
    constructor(Skia: Skia, fn: (Skia: Skia, ctx: Ctx) => SkParagraph, context?: Ctx);
    layout(width: number): void;
    paint(canvas: SkCanvas, x: number, y: number): void;
    getHeight(): number;
    getMaxWidth(): number;
    getMinIntrinsicWidth(): number;
    getMaxIntrinsicWidth(): number;
    getLongestLine(): number;
    getGlyphPositionAtCoordinate(x: number, y: number): number;
    getRectsForRange(start: number, end: number): import("../../../../skia/types").SkRect[];
    getLineMetrics(): import("../../../../skia/types").SkRect[];
    getRectsForPlaceholders(): import("../../../../skia/types").SkRectWithDirection[];
    __typename__: "Paragraph";
    dispose(): void;
}
