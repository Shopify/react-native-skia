import type { SkImage } from "../Image";
export declare abstract class CanvasKitWebGLBuffer {
}
export type NativeBuffer<T extends bigint | ArrayBuffer | CanvasImageSource | CanvasKitWebGLBuffer | unknown = unknown> = T;
export type NativeBufferAddr = NativeBuffer<bigint>;
export type NativeBufferWeb = NativeBuffer<CanvasImageSource>;
export type NativeBufferNode = NativeBuffer<ArrayBuffer>;
export declare const isNativeBufferAddr: (buffer: NativeBuffer) => buffer is NativeBufferAddr;
export declare const isNativeBufferWeb: (buffer: NativeBuffer) => buffer is NativeBufferWeb;
export declare const isNativeBufferNode: (buffer: NativeBuffer) => buffer is NativeBufferNode;
export interface NativeBufferFactory {
    /**
     * Copy pixels to a native buffer.
     */
    MakeFromImage: (image: SkImage) => NativeBuffer;
    /**
     * Release a native buffer that was created with `MakeFromImage`.
     */
    Release: (nativeBuffer: NativeBuffer) => void;
}
