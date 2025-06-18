import type { CanvasKit } from "canvaskit-wasm";
import type { SkData, ImageInfo, SkImage, NativeBuffer, ImageFactory } from "../types";
import { Host } from "./Host";
import { JsiSkImage } from "./JsiSkImage";
import type { JsiSkSurface } from "./JsiSkSurface";
export declare class JsiSkImageFactory extends Host implements ImageFactory {
    constructor(CanvasKit: CanvasKit);
    MakeImageFromViewTag(viewTag: number): Promise<SkImage | null>;
    MakeImageFromNativeBuffer(buffer: NativeBuffer, surface?: JsiSkSurface, image?: JsiSkImage): JsiSkImage;
    MakeImageFromEncoded(encoded: SkData): JsiSkImage | null;
    MakeImageFromNativeTextureUnstable(): SkImage;
    MakeImage(info: ImageInfo, data: SkData, bytesPerRow: number): JsiSkImage | null;
}
