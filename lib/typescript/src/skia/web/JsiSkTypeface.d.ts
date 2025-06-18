import type { CanvasKit, Typeface } from "canvaskit-wasm";
import type { SkTypeface } from "../types";
import { HostObject } from "./Host";
export declare class JsiSkTypeface extends HostObject<Typeface, "Typeface"> implements SkTypeface {
    constructor(CanvasKit: CanvasKit, ref: Typeface);
    get bold(): boolean;
    get italic(): boolean;
    getGlyphIDs(str: string, numCodePoints?: number): number[];
    dispose: () => void;
}
