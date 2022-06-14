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
}
