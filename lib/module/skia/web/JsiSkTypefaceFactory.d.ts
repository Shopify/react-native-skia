import type { CanvasKit } from "canvaskit-wasm";
import type { SkData, TypefaceFactory } from "../types";
import { Host } from "./Host";
import { JsiSkTypeface } from "./JsiSkTypeface";
export declare class JsiSkTypefaceFactory extends Host implements TypefaceFactory {
    constructor(CanvasKit: CanvasKit);
    MakeFreeTypeFaceFromData(data: SkData): JsiSkTypeface | null;
}
