import type { PaintProps } from "../../../dom/types";
import type { SkPaint, Skia } from "../../../skia/types";
export declare const setPaintProperties: (Skia: Skia, paint: SkPaint, { opacity, color, blendMode, strokeWidth, style, strokeJoin, strokeCap, strokeMiter, antiAlias, dither, }: PaintProps) => void;
