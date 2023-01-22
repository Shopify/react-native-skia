import type { CanvasKit, Surface } from "canvaskit-wasm";

import type { SkCanvas, SurfaceFactory } from "../types";

import { Host } from "./Host";
import { JsiSkCanvas } from "./JsiSkCanvas";
import { JsiSkImage } from "./JsiSkImage";
import { JsiSkSurface } from "./JsiSkSurface";

export class JsiSkSurfaceFactory extends Host implements SurfaceFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  Make(width: number, height: number) {
    const surface = this.CanvasKit.MakeSurface(width, height);
    if (!surface) {
      throw new Error("Could not create surface");
    }
    return new JsiSkSurface(this.CanvasKit, surface);
  }

  drawAsImage(cb: (canvas: SkCanvas) => void, width: number, height: number) {
    // On Node we can use webgl view headless-gl, for now default to CPU here.
    // OffscreenCanvas is not available on Safari.
    let surface: Surface | null;
    if (globalThis.OffscreenCanvas === undefined) {
      surface = this.CanvasKit.MakeSurface(width, height);
    } else {
      const offscreen = new globalThis.OffscreenCanvas(width, height);
      surface = this.CanvasKit.MakeWebGLCanvasSurface(
        offscreen as unknown as HTMLCanvasElement
      );
    }
    if (!surface) {
      throw new Error("Could not create surface");
    }
    const canvas = surface.getCanvas();
    cb(new JsiSkCanvas(this.CanvasKit, canvas));
    const image = surface.makeImageSnapshot();
    return new JsiSkImage(this.CanvasKit, image);
  }
}
