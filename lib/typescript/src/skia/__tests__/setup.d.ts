import { Skia } from "../types";
import { JsiSkApi } from "../web";
declare let Skia: ReturnType<typeof JsiSkApi>;
export declare const setupSkia: (width?: number, height?: number) => {
    surface: import("../types").SkSurface;
    width: number;
    height: number;
    center: {
        x: number;
        y: number;
    };
    canvas: import("../types").SkCanvas;
    Skia: Skia;
    CanvasKit: import("canvaskit-wasm").CanvasKit;
};
export {};
