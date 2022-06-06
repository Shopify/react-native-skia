import type { CanvasKit } from "canvaskit-wasm";

import type { SurfaceFactory } from "../../types";

import { Host } from "./Host";
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
}
