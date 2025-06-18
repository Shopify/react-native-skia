"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isNativeBufferWeb = exports.isNativeBufferNode = exports.isNativeBufferAddr = exports.CanvasKitWebGLBuffer = void 0;
class CanvasKitWebGLBuffer {}
exports.CanvasKitWebGLBuffer = CanvasKitWebGLBuffer;
const isNativeBufferAddr = buffer => buffer instanceof BigInt;
exports.isNativeBufferAddr = isNativeBufferAddr;
const isNativeBufferWeb = buffer => buffer instanceof HTMLVideoElement || buffer instanceof HTMLCanvasElement || buffer instanceof ImageBitmap || buffer instanceof OffscreenCanvas || typeof VideoFrame !== "undefined" && buffer instanceof VideoFrame || buffer instanceof HTMLImageElement || buffer instanceof SVGImageElement || buffer instanceof CanvasKitWebGLBuffer;
exports.isNativeBufferWeb = isNativeBufferWeb;
const isNativeBufferNode = buffer => buffer instanceof ArrayBuffer;
exports.isNativeBufferNode = isNativeBufferNode;
//# sourceMappingURL=NativeBufferFactory.js.map