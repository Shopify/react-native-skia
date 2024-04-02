import type { CanvasKit, Surface } from "canvaskit-wasm";

import type { SurfaceFactory } from "../types";

import { Host } from "./Host";
import { JsiSkSurface } from "./JsiSkSurface";

export class JsiSkSurfaceFactory extends Host implements SurfaceFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  Make(width: number, height: number) {
    var pixelLen = width * height * 4; // it's 8888, so 4 bytes per pixel
    // Allocate the buffer of pixels to be drawn into.
    const pixelPtr = this.CanvasKit.Malloc(Uint8Array, pixelLen);
    // MakeRasterDirectSurface
    const surface = this.CanvasKit.MakeRasterDirectSurface(
      {
        width: width,
        height: height,
        colorType: this.CanvasKit.ColorType.RGBA_8888,
        alphaType: this.CanvasKit.AlphaType.Unpremul,
        colorSpace: this.CanvasKit.ColorSpace.SRGB,
      },
      pixelPtr,
      width * 4
    );
    if (!surface) {
      return null;
    }
    return new JsiSkSurface(this.CanvasKit, surface, () => {
      this.CanvasKit.Free(pixelPtr);
    });
  }

  MakeOffscreen(width: number, height: number) {
    // OffscreenCanvas may be unvailable in some environments.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const OC = (globalThis as any).OffscreenCanvas;
    let surface: Surface | null;
    if (OC === undefined) {
      surface = this.CanvasKit.MakeSurface(width, height);
    } else {
      const offscreen = new OC(width, height);
      const webglContext = this.CanvasKit.GetWebGLContext(offscreen);
      const grContext = this.CanvasKit.MakeWebGLContext(webglContext);
      if (!grContext) {
        throw new Error("Could not make a graphics context");
      }
      surface = this.CanvasKit.MakeRenderTarget(grContext, width, height);
    }
    if (!surface) {
      return null;
    }
    return new JsiSkSurface(this.CanvasKit, surface);
  }
}
