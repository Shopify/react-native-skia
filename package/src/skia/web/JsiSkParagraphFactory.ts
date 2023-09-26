import type { CanvasKit } from "canvaskit-wasm";

import type { ParagraphFactory } from "../types/Paragraph";

import { Host } from "./Host";

export class JsiSkParagraphFactory extends Host implements ParagraphFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  TokenizeText(_text: string) {
    return null;
  }

  RequiresClientICU() {
    return false;
  }
}
