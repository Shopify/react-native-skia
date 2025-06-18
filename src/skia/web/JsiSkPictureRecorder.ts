import type { CanvasKit, PictureRecorder } from "canvaskit-wasm";

import type { SkRect } from "../types";
import type { SkPictureRecorder } from "../types/Picture/PictureRecorder";

import { HostObject } from "./Host";
import { JsiSkCanvas } from "./JsiSkCanvas";
import { JsiSkPicture } from "./JsiSkPicture";
import { JsiSkRect } from "./JsiSkRect";

export class JsiSkPictureRecorder
  extends HostObject<PictureRecorder, "PictureRecorder">
  implements SkPictureRecorder
{
  constructor(CanvasKit: CanvasKit, ref: PictureRecorder) {
    super(CanvasKit, ref, "PictureRecorder");
  }

  dispose = () => {
    this.ref.delete();
  };

  beginRecording(bounds?: SkRect) {
    return new JsiSkCanvas(
      this.CanvasKit,
      this.ref.beginRecording(
        bounds
          ? JsiSkRect.fromValue(this.CanvasKit, bounds)
          : Float32Array.of(0, 0, 2_000_000, 2_000_000)
      )
    );
  }

  finishRecordingAsPicture() {
    return new JsiSkPicture(
      this.CanvasKit,
      this.ref.finishRecordingAsPicture()
    );
  }
}
