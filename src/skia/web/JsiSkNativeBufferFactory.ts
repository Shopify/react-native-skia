import type { CanvasKit } from "canvaskit-wasm";

import type { NativeBuffer, NativeBufferFactory, SkImage } from "../types";

import { Host } from "./Host";

export class JsiSkNativeBufferFactory
  extends Host
  implements NativeBufferFactory
{
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  MakeFromImage(image: SkImage): NativeBuffer {
    const info = image.getImageInfo();
    const uint8ClampedArray = new Uint8ClampedArray(image.readPixels()!);
    const imageData = new ImageData(uint8ClampedArray, info.width, info.height);
    const canvas = new OffscreenCanvas(info.width, info.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2d context from canvas");
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  Release(_nativeBuffer: NativeBuffer) {
    // it's a noop on Web
  }
}
