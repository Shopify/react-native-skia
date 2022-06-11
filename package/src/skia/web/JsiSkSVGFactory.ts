import type { CanvasKit } from "canvaskit-wasm";

import type { SkData, SkSVG } from "../types";
import type { SVGFactory } from "../types/SVG/SVGFactory";

import { Host, NotImplementedOnRNWeb } from "./Host";

export class JsiSkSVGFactory extends Host implements SVGFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  MakeFromData(_data: SkData): SkSVG | null {
    throw new NotImplementedOnRNWeb();
  }

  MakeFromString(_str: string): SkSVG | null {
    throw new NotImplementedOnRNWeb();
  }
}
