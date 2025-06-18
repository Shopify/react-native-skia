import type { CanvasKit, ImageFilter } from "canvaskit-wasm";
import type { SkImageFilter } from "../types";
import { HostObject } from "./Host";
export declare class JsiSkImageFilter extends HostObject<ImageFilter, "ImageFilter"> implements SkImageFilter {
    constructor(CanvasKit: CanvasKit, ref: ImageFilter);
    dispose: () => void;
}
