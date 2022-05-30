// TODO: suggest to rename SkPicture to Picture for consistency
import type { CanvasKit, SkPicture as Picture } from "canvaskit-wasm";

import type {
  FilterMode,
  SkRect,
  TileMode,
  SkPicture,
  SkMatrix,
} from "../../types";

import { HostObject, toValue, ckEnum } from "./Host";
import { JsiSkShader } from "./JsiSkShader";

export class JsiSkPicture
  extends HostObject<Picture, "Picture">
  implements SkPicture
{
  constructor(CanvasKit: CanvasKit, ref: Picture) {
    super(CanvasKit, ref, "Picture");
  }

  makeShader(
    tmx: TileMode,
    tmy: TileMode,
    mode: FilterMode,
    localMatrix?: SkMatrix,
    tileRect?: SkRect
  ) {
    return new JsiSkShader(
      this.CanvasKit,
      this.ref.makeShader(
        ckEnum(tmx),
        ckEnum(tmy),
        ckEnum(mode),
        localMatrix ? toValue(localMatrix) : undefined,
        tileRect ? toValue(tileRect) : undefined
      )
    );
  }

  serialize() {
    return this.ref.serialize();
  }
}
