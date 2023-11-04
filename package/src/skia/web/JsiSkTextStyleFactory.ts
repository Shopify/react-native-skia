import type { CanvasKit } from "canvaskit-wasm";

import type { TextStyleFactory } from "../types";

import { Host } from "./Host";
import { JsiSkTextStyle } from "./JsiSkTextStyle";

export class JsiSkTextStyleFactory extends Host implements TextStyleFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  Make() {
    return new JsiSkTextStyle(this.CanvasKit, new this.CanvasKit.TextStyle({}));
  }
}
