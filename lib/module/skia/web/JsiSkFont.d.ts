import type { CanvasKit, Font } from "canvaskit-wasm";
import type { FontEdging, FontHinting, SkFont, SkPaint, SkPoint, SkRect, SkTypeface } from "../types";
import { HostObject } from "./Host";
import { JsiSkRect } from "./JsiSkRect";
import { JsiSkTypeface } from "./JsiSkTypeface";
export declare class JsiSkFont extends HostObject<Font, "Font"> implements SkFont {
    constructor(CanvasKit: CanvasKit, ref: Font);
    measureText(_text: string, _paint?: SkPaint | undefined): SkRect;
    dispose: () => void;
    getTextWidth(text: string, paint?: SkPaint | undefined): number;
    getMetrics(): {
        ascent: number;
        descent: number;
        leading: number;
        bounds: JsiSkRect | undefined;
    };
    getGlyphIDs(str: string, numCodePoints?: number): number[];
    getGlyphWidths(glyphs: number[], paint?: SkPaint | null): number[];
    getGlyphIntercepts(glyphs: number[], positions: SkPoint[], top: number, bottom: number): number[];
    getScaleX(): number;
    getSize(): number;
    getSkewX(): number;
    isEmbolden(): boolean;
    getTypeface(): JsiSkTypeface | null;
    setEdging(edging: FontEdging): void;
    setEmbeddedBitmaps(embeddedBitmaps: boolean): void;
    setHinting(hinting: FontHinting): void;
    setLinearMetrics(linearMetrics: boolean): void;
    setScaleX(sx: number): void;
    setSize(points: number): void;
    setSkewX(sx: number): void;
    setEmbolden(embolden: boolean): void;
    setSubpixel(subpixel: boolean): void;
    setTypeface(face: SkTypeface | null): void;
}
