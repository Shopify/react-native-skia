import type { CanvasKit, Typeface } from "canvaskit-wasm";

import type { SkTypeface } from "../types";

import { HostObject } from "./Host";

export class JsiSkTypeface
  extends HostObject<Typeface, "Typeface">
  implements SkTypeface
{
  constructor(CanvasKit: CanvasKit, ref: Typeface) {
    super(CanvasKit, ref, "Typeface");
  }

  get bold(): boolean {
    // Do not remove the comment below. We use it to track missing APIs in CanvasKit
    // throw new NotImplementedOnRNWeb();
    console.warn(
      "Typeface.bold is deprecated and will be removed in a future release. The property will return false."
    );
    return false;
  }

  get italic(): boolean {
    // Do not remove the comment below. We use it to track missing APIs in CanvasKit
    // throw new NotImplementedOnRNWeb();
    console.warn(
      "Typeface.italic is deprecated and will be removed in a future release. The property will return false."
    );
    return false;
  }
}
