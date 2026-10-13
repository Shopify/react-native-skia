import type {
  CanvasKit,
  GrDirectContext,
  WebGLContextHandle,
} from "canvaskit-wasm";

// One WebGL context per CanvasKit instance, shared by every offscreen surface
// (a render target on it) and every canvas drawn by the shared renderer (see
// SkiaWebRenderer), which paints on its drawing buffer and copies the frame
// out. A context per surface or per canvas runs into the browser's cap on
// live contexts per page (16 in Chrome), past which it evicts the oldest one,
// visible or not. Sharing the context also lets an image from one surface or
// canvas be drawn on another, which a texture from a different context can't
// be.
export interface SharedWebGLContext {
  canvas: OffscreenCanvas;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  handle: WebGLContextHandle;
  grContext: GrDirectContext;
}
const sharedContexts = new WeakMap<CanvasKit, SharedWebGLContext>();

const releaseSharedContext = (
  CanvasKit: CanvasKit,
  { handle, grContext }: SharedWebGLContext
) => {
  grContext.releaseResourcesAndAbandonContext();
  grContext.delete();
  CanvasKit.deleteContext(handle);
  // Clears CanvasKit's current-context globals, which would otherwise keep
  // referencing the context (see SkiaWebRenderer). With a deleted handle this
  // creates nothing.
  CanvasKit.MakeWebGLContext(handle);
};

/**
 * Returns the shared context, creating it on first use, and again once the
 * browser took it away (a GPU reset or an eviction): what was built on the
 * previous one is gone.
 */
export const getSharedWebGLContext = (
  CanvasKit: CanvasKit,
  OC: typeof OffscreenCanvas
) => {
  const current = sharedContexts.get(CanvasKit);
  if (current && !current.gl.isContextLost()) {
    return current;
  }
  if (current) {
    sharedContexts.delete(CanvasKit);
    releaseSharedContext(CanvasKit, current);
  }
  // Offscreen surfaces are textures of their own: the drawing buffer is only
  // used by the shared renderer, which sizes it.
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
  const context = { canvas, gl, handle, grContext };
  sharedContexts.set(CanvasKit, context);
  return context;
};
