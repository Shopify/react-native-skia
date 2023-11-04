import type { CanvasKit } from "canvaskit-wasm";

import type { ParagraphStyleFactory } from "../types";

import { Host } from "./Host";
import { JsiSkParagraphStyle } from "./JsiSkParagraphStyle";

export class JsiSkParagraphStyleFactory
  extends Host
  implements ParagraphStyleFactory
{
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  Make() {
    return new JsiSkParagraphStyle(
      this.CanvasKit,
      new this.CanvasKit.ParagraphStyle({})
    );
  }
}
