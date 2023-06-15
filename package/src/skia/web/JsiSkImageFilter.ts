import type { CanvasKit, ImageFilter } from "canvaskit-wasm";

import type { SkImageFilter } from "../types";

import { HostObject } from "./Host";

export class JsiSkImageFilter
  extends HostObject<ImageFilter, "ImageFilter">
  implements SkImageFilter
{
  constructor(CanvasKit: CanvasKit, ref: ImageFilter) {
    super(CanvasKit, ref, "ImageFilter");
  }

  dispose = () => {
    this.ref.delete();
  };
}
