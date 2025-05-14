import type { CanvasKit } from "canvaskit-wasm";

import type { SkottieFactory, SkManagedSkottieAnimation } from "../types";
import type { SkSkottieAnimation } from "../types/Skottie";

import { Host } from "./Host";
import { JsiSkottieAnimation } from "./JsiSkottieAnimation";

export class JsiSkottieFactory extends Host implements SkottieFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  Make(json: string): SkSkottieAnimation {
    const animation = this.CanvasKit.MakeAnimation(json);
    if (!animation) {
      throw new Error("Failed to create SkottieAnimation");
    }
    return new JsiSkottieAnimation(this.CanvasKit, animation);
  }

  MakeManagedAnimation(
    _json: string,
    _assets?: Record<string, ArrayBuffer>,
    _filterPrefix?: string
  ): //soundMap?: SoundMap
  SkManagedSkottieAnimation {
    throw new Error("Not implemented yet");
  }
}
