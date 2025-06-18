export class JsiSkFont extends HostObject {
    constructor(CanvasKit: any, ref: any);
    measureText(_text: any, _paint: any): jest.Mock<any, any, any>;
    getTextWidth(text: any, paint: any): any;
    getMetrics(): {
        ascent: any;
        descent: any;
        leading: any;
        bounds: JsiSkRect | undefined;
    };
    getGlyphIDs(str: any, numCodePoints: any): any[];
    getGlyphWidths(glyphs: any, paint: any): any[];
    getGlyphIntercepts(glyphs: any, positions: any, top: any, bottom: any): any[];
    getScaleX(): any;
    getSize(): any;
    getSkewX(): any;
    isEmbolden(): any;
    getTypeface(): JsiSkTypeface | null;
    setEdging(edging: any): void;
    setEmbeddedBitmaps(embeddedBitmaps: any): void;
    setHinting(hinting: any): void;
    setLinearMetrics(linearMetrics: any): void;
    setScaleX(sx: any): void;
    setSize(points: any): void;
    setSkewX(sx: any): void;
    setEmbolden(embolden: any): void;
    setSubpixel(subpixel: any): void;
    setTypeface(face: any): void;
}
import { HostObject } from "./Host";
import { JsiSkRect } from "./JsiSkRect";
import { JsiSkTypeface } from "./JsiSkTypeface";
