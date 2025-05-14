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
    return new JsiSkottieAnimation(
      this.CanvasKit,
      this.CanvasKit.MakeAnimation(json)
    );
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
