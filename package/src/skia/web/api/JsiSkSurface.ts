import type { CanvasKit, Surface } from "canvaskit-wasm";

import type { SkRect } from "../../Rect";
import type { SkSurface } from "../../Surface/Surface";
import type { SkCanvas } from "../../Canvas";
import type { SkImage } from "../../Image";

import { HostObject, toUndefinedableValue } from "./Host";
import { JsiSkCanvas } from "./JsiSkCanvas";
import { JsiSkImage } from "./JsiSkImage";

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

  makeImageSnapshot(bounds?: SkRect): SkImage {
    const image = this.ref.makeImageSnapshot(toUndefinedableValue(bounds));
    return new JsiSkImage(this.CanvasKit, image);
  }
}
