import type { CanvasKit, MaskFilter } from "canvaskit-wasm";

import type { SkMaskFilter } from "../types";

import { HostObject } from "./Host";

export class JsiSkMaskFilter
  extends HostObject<MaskFilter, "MaskFilter">
  implements SkMaskFilter
{
  constructor(CanvasKit: CanvasKit, ref: MaskFilter) {
    super(CanvasKit, ref, "MaskFilter");
  }

  dispose = () => {
    this.ref.delete();
  };
}
