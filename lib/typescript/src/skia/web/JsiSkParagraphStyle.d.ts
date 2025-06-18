import type { CanvasKit, ParagraphStyle } from "canvaskit-wasm";
import type { SkParagraphStyle } from "../types";
export declare class JsiSkParagraphStyle {
    static toParagraphStyle(ck: CanvasKit, value: SkParagraphStyle): ParagraphStyle;
}
