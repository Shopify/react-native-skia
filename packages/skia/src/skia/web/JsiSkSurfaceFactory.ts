import type {
  CanvasKit,
  GrDirectContext,
  WebGLContextHandle,
} from "canvaskit-wasm";

import type { GPUTextureHandle, SkSurface, SurfaceFactory } from "../types";

import { Host, throwNotImplementedOnRNWeb } from "./Host";
import { JsiSkSurface } from "./JsiSkSurface";

// Every offscreen surface is a render target on one WebGL context, shared per
// CanvasKit instance. A context per surface was never released: CanvasKit
// keeps a context registered until deleteContext(), which disposing a surface
// doesn't call, and browsers cap the number of live contexts per page (16 in
// Chrome) by evicting the oldest one, an on-screen <Canvas> or another surface
// alike. Sharing the context also lets the snapshot of one offscreen surface
// be drawn on another, which a texture from a different context can't be.
interface OffscreenContext {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  handle: WebGLContextHandle;
  grContext: GrDirectContext;
}
const offscreenContexts = new WeakMap<CanvasKit, OffscreenContext>();

const releaseOffscreenContext = (
  CanvasKit: CanvasKit,
  { handle, grContext }: OffscreenContext
) => {
  grContext.releaseResourcesAndAbandonContext();
  grContext.delete();
  CanvasKit.deleteContext(handle);
  // Clears CanvasKit's current-context globals, which would otherwise keep
  // referencing the context (see SkiaWebRenderer). With a deleted handle this
  // creates nothing.
  CanvasKit.MakeWebGLContext(handle);
};

const getOffscreenContext = (
  CanvasKit: CanvasKit,
  OC: typeof OffscreenCanvas
) => {
  const current = offscreenContexts.get(CanvasKit);
  if (current && !current.gl.isContextLost()) {
    return current.grContext;
  }
  if (current) {
    // The browser took the context away (a GPU reset or an eviction): the
    // surfaces built on it are gone, the next ones get a new context.
    offscreenContexts.delete(CanvasKit);
    releaseOffscreenContext(CanvasKit, current);
  }
  // A render target is a texture of its own: the canvas only holds the
  // context, and its drawing buffer is never used.
  const canvas = new OC(1, 1);
  const handle = CanvasKit.GetWebGLContext(canvas);
  if (!handle) {
    throw new Error("Could not create a WebGL context");
  }
  // CanvasKit just created the context; asking for it again hands back the
  // same object.
  const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
  const grContext = CanvasKit.MakeWebGLContext(handle);
  if (!gl || !grContext) {
    grContext?.delete();
    CanvasKit.deleteContext(handle);
    CanvasKit.MakeWebGLContext(handle);
    throw new Error("Could not make a graphics context");
  }
  offscreenContexts.set(CanvasKit, { gl, handle, grContext });
  return grContext;
};

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
    const grContext = getOffscreenContext(this.CanvasKit, OC);
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
