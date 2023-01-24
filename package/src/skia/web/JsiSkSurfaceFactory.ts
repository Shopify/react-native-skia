import type { CanvasKit, Surface } from "canvaskit-wasm";

import type { SurfaceFactory } from "../types";

import { Host } from "./Host";
import { JsiSkSurface } from "./JsiSkSurface";

export class JsiSkSurfaceFactory extends Host implements SurfaceFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  Make(width: number, height: number) {
    const surface = this.CanvasKit.MakeSurface(width, height);
    if (!surface) {
      return null;
    }
    return new JsiSkSurface(this.CanvasKit, surface);
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
      surface = this.CanvasKit.MakeWebGLCanvasSurface(
        offscreen as unknown as HTMLCanvasElement
      );
    }
    if (!surface) {
      return null;
    }
    return new JsiSkSurface(this.CanvasKit, surface);
  }
}
