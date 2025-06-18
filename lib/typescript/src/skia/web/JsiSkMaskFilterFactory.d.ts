import type { CanvasKit } from "canvaskit-wasm";
import type { BlurStyle } from "../types";
import type { MaskFilterFactory } from "../types/MaskFilter";
import { Host } from "./Host";
import { JsiSkMaskFilter } from "./JsiSkMaskFilter";
export declare class JsiSkMaskFilterFactory extends Host implements MaskFilterFactory {
    constructor(CanvasKit: CanvasKit);
    MakeBlur(style: BlurStyle, sigma: number, respectCTM: boolean): JsiSkMaskFilter;
}
