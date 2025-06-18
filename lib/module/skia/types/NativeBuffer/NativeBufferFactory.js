export class CanvasKitWebGLBuffer {}
export const isNativeBufferAddr = buffer => buffer instanceof BigInt;
export const isNativeBufferWeb = buffer => buffer instanceof HTMLVideoElement || buffer instanceof HTMLCanvasElement || buffer instanceof ImageBitmap || buffer instanceof OffscreenCanvas || typeof VideoFrame !== "undefined" && buffer instanceof VideoFrame || buffer instanceof HTMLImageElement || buffer instanceof SVGImageElement || buffer instanceof CanvasKitWebGLBuffer;
export const isNativeBufferNode = buffer => buffer instanceof ArrayBuffer;
//# sourceMappingURL=NativeBufferFactory.js.map