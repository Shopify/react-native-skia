import type { CanvasKit, TextBlob } from "canvaskit-wasm";

import type { SkTextBlob } from "../types";

import { HostObject } from "./Host";

export class JsiSkTextBlob
  extends HostObject<TextBlob, "TextBlob">
  implements SkTextBlob
{
  constructor(CanvasKit: CanvasKit, ref: TextBlob) {
    super(CanvasKit, ref, "TextBlob");
  }

  dispose = () => {
    this.ref.delete();
  };
}
