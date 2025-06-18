import type { CanvasKit, FontMgr } from "canvaskit-wasm";
import type { FontStyle, SkFontMgr, SkTypeface } from "../types";
import { HostObject } from "./Host";
export declare class JsiSkFontMgr extends HostObject<FontMgr, "FontMgr"> implements SkFontMgr {
    constructor(CanvasKit: CanvasKit, ref: FontMgr);
    dispose(): void;
    countFamilies(): number;
    getFamilyName(index: number): string;
    matchFamilyStyle(_familyName: string, _fontStyle: FontStyle): SkTypeface;
}
