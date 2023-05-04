import type { CanvasKit } from "canvaskit-wasm";

import type { TypefaceFontProviderFactory } from "../types/TypefaceFontProvider";

import { Host } from "./Host";
import { JsiSkTypefaceFontProvider } from "./JsiSkTypefaceFontProvider";

export class JsiSkTypefaceFontProviderFactory
  extends Host
  implements TypefaceFontProviderFactory
{
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  Make() {
    const tf = this.CanvasKit.TypefaceFontProvider.Make();
    return new JsiSkTypefaceFontProvider(this.CanvasKit, tf);
  }
}
