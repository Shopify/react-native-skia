import type { CanvasKit, Surface } from "canvaskit-wasm";

import type { ColorType, SurfaceFactory } from "../types";

import { Host } from "./Host";
import { JsiSkSurface } from "./JsiSkSurface";

export class JsiSkSurfaceFactory extends Host implements SurfaceFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  Make(width: number, height: number) {
    return new JsiSkSurface(
      this.CanvasKit,
      this.CanvasKit.MakeSurface(width, height)!
    );
  }

  MakeOffscreen(width: number, height: number, _colorType?: ColorType) {
    // OffscreenCanvas may be unvailable in some environments.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const OC = (globalThis as any).OffscreenCanvas;
    let surface: Surface | null;
    if (OC === undefined) {
      return this.Make(width, height);
    } else {
      const offscreen = new OC(width, height);
      const webglContext = this.CanvasKit.GetWebGLContext(offscreen);
      const grContext = this.CanvasKit.MakeWebGLContext(webglContext);
      if (!grContext) {
        throw new Error("Could not make a graphics context");
      }

      // TODO: if a 16bit color type is provided, we can work around it to provide it via CanvasKit

      surface = this.CanvasKit.MakeRenderTarget(grContext, width, height);
      // Note: CanvasKit doesn't directly support specifying ColorType in MakeRenderTarget
      // This is a limitation of the web implementation
    }
    if (!surface) {
      return null;
    }
    return new JsiSkSurface(this.CanvasKit, surface);
  }

  // On Web at the moment we only support RGBA_8888 or RGBA_F16
  // private convertColorType(colorType: ColorType) {
  //   switch (colorType) {
  //     case ColorType.RGBA_8888:
  //       return this.CanvasKit.ColorType.RGBA_8888;
  //     case ColorType.BGRA_8888:
  //       return this.CanvasKit.ColorType.BGRA_8888;
  //     case ColorType.RGB_565:
  //       return this.CanvasKit.ColorType.RGB_565;
  //     case ColorType.RGBA_F16:
  //       return this.CanvasKit.ColorType.RGBA_F16;
  //     case ColorType.Gray_8:
  //       return this.CanvasKit.ColorType.Gray_8;
  //     case ColorType.RGBA_1010102:
  //       return this.CanvasKit.ColorType.RGBA_1010102;
  //     default:
  //       return this.CanvasKit.ColorType.RGBA_8888;
  //   }
  // }
}
