import type { CanvasKit } from "canvaskit-wasm";
import type { NativeBuffer, NativeBufferFactory, SkImage } from "../types";
import { Host } from "./Host";
export declare class JsiSkNativeBufferFactory extends Host implements NativeBufferFactory {
    constructor(CanvasKit: CanvasKit);
    MakeFromImage(image: SkImage): NativeBuffer;
    Release(_nativeBuffer: NativeBuffer): void;
}
