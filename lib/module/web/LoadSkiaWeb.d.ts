import type { CanvasKit as CanvasKitType, CanvasKitInitOptions } from "canvaskit-wasm";
declare global {
    var CanvasKit: CanvasKitType;
}
export declare const LoadSkiaWeb: (opts?: CanvasKitInitOptions) => Promise<void>;
export declare const LoadSkia: (opts?: CanvasKitInitOptions) => Promise<void>;
