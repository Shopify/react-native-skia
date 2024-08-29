import type { CanvasKit, ColorFilter } from "canvaskit-wasm";

import type { SkColorFilter } from "../types";

import { HostObject } from "./Host";

export class JsiSkColorFilter
  extends HostObject<ColorFilter, "ColorFilter">
  implements SkColorFilter
{
  constructor(CanvasKit: CanvasKit, ref: ColorFilter) {
    super(CanvasKit, ref, "ColorFilter");
  }

  dispose = () => {
    this.ref.delete();
  };
}
