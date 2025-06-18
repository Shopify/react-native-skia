import type { Surface, TextureSource, Image } from "canvaskit-wasm";
import { CanvasKitWebGLBuffer } from "../types";
export declare class CanvasKitWebGLBufferImpl extends CanvasKitWebGLBuffer {
    surface: Surface;
    private source;
    image: Image | null;
    constructor(surface: Surface, source: TextureSource);
    toImage(): Image;
}
