import type { CanvasKit, Image } from "canvaskit-wasm";
import type { FilterMode, MipmapMode, SkImage, SkMatrix, SkShader, TileMode, ImageFormat, ImageInfo } from "../types";
import { HostObject } from "./Host";
export declare const toBase64String: (bytes: Uint8Array) => string;
export declare class JsiSkImage extends HostObject<Image, "Image"> implements SkImage {
    constructor(CanvasKit: CanvasKit, ref: Image);
    height(): number;
    width(): number;
    getImageInfo(): ImageInfo;
    makeShaderOptions(tx: TileMode, ty: TileMode, fm: FilterMode, mm: MipmapMode, localMatrix?: SkMatrix): SkShader;
    makeShaderCubic(tx: TileMode, ty: TileMode, B: number, C: number, localMatrix?: SkMatrix): SkShader;
    encodeToBytes(fmt?: ImageFormat, quality?: number): Uint8Array<ArrayBufferLike>;
    encodeToBase64(fmt?: ImageFormat, quality?: number): string;
    readPixels(srcX?: number, srcY?: number, imageInfo?: ImageInfo): Float32Array<ArrayBufferLike> | Uint8Array<ArrayBufferLike> | null;
    dispose: () => void;
    makeNonTextureImage(): SkImage;
    getNativeTextureUnstable(): unknown;
}
