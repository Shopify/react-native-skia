import type { ColorFilter } from "canvaskit-wasm";

import type { SkColorFilter } from "../../ColorFilter/ColorFilter";

import { HostObject } from "./HostObject";

export class JsiSkColorFilter
  extends HostObject<ColorFilter, "ColorFilter">
  implements SkColorFilter
{
  constructor(ref: ColorFilter) {
    super(ref, "ColorFilter");
  }
}
