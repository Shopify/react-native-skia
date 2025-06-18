import type { CanvasKit } from "canvaskit-wasm";
import type { SkSVG } from "../types";
import { HostObject } from "./Host";
export declare class JsiSkSVG extends HostObject<HTMLImageElement, "SVG"> implements SkSVG {
    constructor(CanvasKit: CanvasKit, ref: HTMLImageElement);
    width(): number;
    height(): number;
    dispose: () => void;
}
