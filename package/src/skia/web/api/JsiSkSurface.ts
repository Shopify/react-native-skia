import type { CanvasKit, Surface } from "canvaskit-wasm";

import type { SkRect } from "../../Rect";
import type { SkSurface } from "../../Surface/Surface";
import type { SkCanvas } from "../../Canvas";
import type { SkImage } from "../../Image";

import { HostObject } from "./Host";
import { JsiSkCanvas } from "./JsiSkCanvas";

export class JsiSkSurface
  extends HostObject<Surface, "Surface">
  implements SkSurface
{
  constructor(CanvasKit: CanvasKit, ref: Surface) {
    super(CanvasKit, ref, "Surface");
  }

  getCanvas(): SkCanvas {
    return new JsiSkCanvas(this.CanvasKit, this.ref.getCanvas());
  }

  makeImageSnapshot(_bounds?: SkRect): SkImage {
    throw new Error("Method not implemented");
  }
}
