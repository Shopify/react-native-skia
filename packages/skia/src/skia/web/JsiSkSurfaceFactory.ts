import type { CanvasKit } from "canvaskit-wasm";

import type { GPUTextureHandle, SkSurface, SurfaceFactory } from "../types";

import { Host, throwNotImplementedOnRNWeb } from "./Host";
import { JsiSkSurface } from "./JsiSkSurface";
import { getSharedWebGLContext } from "./SharedWebGLContext";

export class JsiSkSurfaceFactory extends Host implements SurfaceFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  MakeRaster(width: number, height: number) {
    return new JsiSkSurface(
      this.CanvasKit,
      this.CanvasKit.MakeSurface(width, height)!
    );
  }

  MakeOffscreen(width: number, height: number) {
    // OffscreenCanvas may be unvailable in some environments.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const OC = (globalThis as any).OffscreenCanvas;
    if (OC === undefined) {
      return this.MakeRaster(width, height);
    }
    // Every offscreen surface is a render target on the shared context.
    const { grContext } = getSharedWebGLContext(this.CanvasKit, OC);
    const surface = this.CanvasKit.MakeRenderTarget(grContext, width, height);
    if (!surface) {
      return null;
    }
    return new JsiSkSurface(this.CanvasKit, surface, grContext);
  }

  MakeFromGPUTexture(_texture: GPUTextureHandle): SkSurface {
    return throwNotImplementedOnRNWeb<SkSurface>();
  }
}
