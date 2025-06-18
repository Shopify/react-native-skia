import type { CanvasKit, TypefaceFontProvider } from "canvaskit-wasm";
import type { SkTypefaceFontProvider } from "../types/Paragraph/TypefaceFontProvider";
import type { FontStyle, SkTypeface } from "../types";
import { HostObject } from "./Host";
export declare class JsiSkTypefaceFontProvider extends HostObject<TypefaceFontProvider, "FontMgr"> implements SkTypefaceFontProvider {
    private allocatedPointers;
    constructor(CanvasKit: CanvasKit, ref: TypefaceFontProvider);
    matchFamilyStyle(_name: string, _style: FontStyle): SkTypeface;
    countFamilies(): number;
    getFamilyName(index: number): string;
    registerFont(typeface: SkTypeface, familyName: string): void;
    dispose(): void;
}
