import type { SkImage } from "../Image";

export type NativeBuffer<
  T extends bigint | ArrayBuffer | CanvasImageSource | unknown = unknown
> = T;

export type NativeBufferAddr = NativeBuffer<bigint>;
export type NativeBufferWeb = NativeBuffer<CanvasImageSource>;
export type NativeBufferNode = NativeBuffer<ArrayBuffer>;

export const isNativeBufferAddr = (
  buffer: NativeBuffer
): buffer is NativeBufferAddr => buffer instanceof BigInt;
export const isNativeBufferWeb = (
  buffer: NativeBuffer
): buffer is NativeBufferWeb =>
  buffer instanceof HTMLVideoElement ||
  buffer instanceof HTMLCanvasElement ||
  buffer instanceof ImageBitmap ||
  buffer instanceof OffscreenCanvas ||
  buffer instanceof VideoFrame ||
  buffer instanceof HTMLImageElement ||
  buffer instanceof SVGImageElement;

export const isNativeBufferNode = (
  buffer: NativeBuffer
): buffer is NativeBufferNode => buffer instanceof ArrayBuffer;

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
