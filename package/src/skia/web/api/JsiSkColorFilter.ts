import type { CanvasKit, ColorFilter } from "canvaskit-wasm";

import type { SkColorFilter } from "../../ColorFilter/ColorFilter";

import { HostObject } from "./Host";

export class JsiSkColorFilter
  extends HostObject<ColorFilter, "ColorFilter">
  implements SkColorFilter
{
  constructor(CanvasKit: CanvasKit, ref: ColorFilter) {
    super(CanvasKit, ref, "ColorFilter");
  }
}
