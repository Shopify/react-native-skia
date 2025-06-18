import type { CanvasKit } from "canvaskit-wasm";
import type { SurfaceFactory } from "../types";
import { Host } from "./Host";
import { JsiSkSurface } from "./JsiSkSurface";
export declare class JsiSkSurfaceFactory extends Host implements SurfaceFactory {
    constructor(CanvasKit: CanvasKit);
    Make(width: number, height: number): JsiSkSurface;
    MakeOffscreen(width: number, height: number): JsiSkSurface | null;
}
