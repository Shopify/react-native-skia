import type { CanvasKit } from "canvaskit-wasm";
import type { ParagraphBuilderFactory, SkParagraphStyle, SkTypefaceFontProvider } from "../types";
import { Host } from "./Host";
import { JsiSkParagraphBuilder } from "./JsiSkParagraphBuilder";
export declare class JsiSkParagraphBuilderFactory extends Host implements ParagraphBuilderFactory {
    constructor(CanvasKit: CanvasKit);
    Make(paragraphStyle: SkParagraphStyle, typefaceProvider?: SkTypefaceFontProvider): JsiSkParagraphBuilder;
}
