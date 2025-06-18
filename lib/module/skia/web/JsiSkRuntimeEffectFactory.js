import { Host } from "./Host";
import { JsiSkRuntimeEffect } from "./JsiSkRuntimeEffect";
export class JsiSkRuntimeEffectFactory extends Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  Make(sksl) {
    const re = this.CanvasKit.RuntimeEffect.Make(sksl);
    if (re === null) {
      return null;
    }
    return new JsiSkRuntimeEffect(this.CanvasKit, re, sksl);
  }
}
//# sourceMappingURL=JsiSkRuntimeEffectFactory.js.map