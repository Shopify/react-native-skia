import type { CanvasKit, MaskFilter } from "canvaskit-wasm";
import type { SkMaskFilter } from "../types";
import { HostObject } from "./Host";
export declare class JsiSkMaskFilter extends HostObject<MaskFilter, "MaskFilter"> implements SkMaskFilter {
    constructor(CanvasKit: CanvasKit, ref: MaskFilter);
    dispose: () => void;
}
