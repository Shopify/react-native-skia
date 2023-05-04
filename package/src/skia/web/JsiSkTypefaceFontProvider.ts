import type { CanvasKit, TypefaceFontProvider } from "canvaskit-wasm";

import type { SkTypefaceFontProvider } from "../types/TypefaceFontProvider";

import { HostObject } from "./Host";

export class JsiSkTypefaceFontProvider
  extends HostObject<TypefaceFontProvider, "TypefaceFontProvider">
  implements SkTypefaceFontProvider
{
  constructor(CanvasKit: CanvasKit, ref: TypefaceFontProvider) {
    super(CanvasKit, ref, "TypefaceFontProvider");
  }

  registerFont(bytes: ArrayBuffer | Uint8Array, family: string) {
    this.ref.registerFont(bytes, family);
  }
}
