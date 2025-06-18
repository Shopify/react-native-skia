import { Host } from "./Host";
export class JsiSkNativeBufferFactory extends Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  MakeFromImage(image) {
    const info = image.getImageInfo();
    const uint8ClampedArray = new Uint8ClampedArray(image.readPixels());
    const imageData = new ImageData(uint8ClampedArray, info.width, info.height);
    const canvas = new OffscreenCanvas(info.width, info.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2d context from canvas");
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }
  Release(_nativeBuffer) {
    // it's a noop on Web
  }
}
//# sourceMappingURL=JsiSkNativeBufferFactory.js.map