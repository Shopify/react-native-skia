import type { CanvasKit } from "canvaskit-wasm";

import type { RuntimeEffectFactory } from "../types/RuntimeEffect/RuntimeEffectFactory";

import { Host } from "./Host";
import { JsiSkRuntimeEffect } from "./JsiSkRuntimeEffect";

export class JsiSkRuntimeEffectFactory
  extends Host
  implements RuntimeEffectFactory
{
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  Make(sksl: string) {
    const re = this.CanvasKit.RuntimeEffect.Make(sksl);
    if (re === null) {
      return null;
    }
    return new JsiSkRuntimeEffect(this.CanvasKit, re, sksl);
  }
}
