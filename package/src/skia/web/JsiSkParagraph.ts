import type { CanvasKit, Paragraph } from "canvaskit-wasm";

import type { SkParagraph } from "../types";

import { HostObject } from "./Host";

export class JsiSkParagraph
  extends HostObject<Paragraph, "Paragraph">
  implements SkParagraph
{
  constructor(CanvasKit: CanvasKit, ref: Paragraph) {
    super(CanvasKit, ref, "Paragraph");
  }

  layout(width: number) {
    this.ref.layout(width);
  }

  getHeight() {
    return this.ref.getHeight();
  }
}
