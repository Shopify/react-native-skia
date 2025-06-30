import type { CanvasKit } from "canvaskit-wasm";

import type { SkottieFactory } from "../types";

import { Host } from "./Host";
import { JsiSkottieAnimation } from "./JsiSkottieAnimation";
import type { JsiSkData } from "./JsiSkData";

export class JsiSkottieFactory extends Host implements SkottieFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  Make(json: string, assets?: Record<string, JsiSkData>) {
    const rawAssets: { [key: string]: ArrayBuffer } = {};
    for (const [key, value] of Object.entries(assets ?? {})) {
      rawAssets[key] = value.ref;
    }
    const animation = this.CanvasKit.MakeManagedAnimation(json, rawAssets);
    if (!animation) {
      throw new Error("Failed to create SkottieAnimation");
    }
    return new JsiSkottieAnimation(this.CanvasKit, animation);
  }
}
