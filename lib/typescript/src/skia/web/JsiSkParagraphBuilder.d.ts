import type { CanvasKit, ParagraphBuilder } from "canvaskit-wasm";
import type { SkParagraphBuilder, SkParagraph, SkTextStyle, SkPaint } from "../types";
import { PlaceholderAlignment, TextBaseline } from "../types";
import { HostObject } from "./Host";
export declare class JsiSkParagraphBuilder extends HostObject<ParagraphBuilder, "ParagraphBuilder"> implements SkParagraphBuilder {
    constructor(CanvasKit: CanvasKit, ref: ParagraphBuilder);
    addPlaceholder(width?: number | undefined, height?: number | undefined, alignment?: PlaceholderAlignment | undefined, baseline?: TextBaseline | undefined, offset?: number | undefined): SkParagraphBuilder;
    addText(text: string): SkParagraphBuilder;
    build(): SkParagraph;
    reset(): void;
    pushStyle(style: SkTextStyle, foregroundPaint?: SkPaint | undefined, backgroundPaint?: SkPaint | undefined): SkParagraphBuilder;
    pop(): SkParagraphBuilder;
    dispose(): void;
    private makePaint;
}
