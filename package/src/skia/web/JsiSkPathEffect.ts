import type { CanvasKit, PathEffect } from "canvaskit-wasm";

import type { SkPathEffect } from "../types/PathEffect";

import { HostObject } from "./Host";

export class JsiSkPathEffect
  extends HostObject<PathEffect, "PathEffect">
  implements SkPathEffect
{
  constructor(CanvasKit: CanvasKit, ref: PathEffect) {
    super(CanvasKit, ref, "PathEffect");
  }

  dispose = () => {
    this.ref.delete();
  };
}
