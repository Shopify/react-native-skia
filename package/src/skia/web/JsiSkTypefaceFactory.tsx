import type { CanvasKit } from "canvaskit-wasm";

import type { SkData, TypefaceFactory } from "../types";

import { Host, toValue } from "./Host";
import { JsiSkTypeface } from "./JsiSkTypeface";

export class JsiSkTypefaceFactory extends Host implements TypefaceFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  MakeFreeTypeFaceFromData(data: SkData) {
    const tf = this.CanvasKit.Typeface.MakeFreeTypeFaceFromData(toValue(data));
    if (tf === null) {
      return null;
    }
    return new JsiSkTypeface(this.CanvasKit, tf);
  }
}
