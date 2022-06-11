import type { CanvasKit } from "canvaskit-wasm";

import type { BlurStyle } from "../types";
import type { MaskFilterFactory } from "../types/MaskFilter";

import { Host, ckEnum } from "./Host";
import { JsiSkMaskFilter } from "./JsiSkMaskFilter";

export class JsiSkMaskFilterFactory extends Host implements MaskFilterFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  MakeBlur(style: BlurStyle, sigma: number, respectCTM: boolean) {
    return new JsiSkMaskFilter(
      this.CanvasKit,
      this.CanvasKit.MaskFilter.MakeBlur(ckEnum(style), sigma, respectCTM)
    );
  }
}
