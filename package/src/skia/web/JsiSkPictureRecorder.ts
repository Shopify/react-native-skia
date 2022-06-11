import type { CanvasKit, PictureRecorder } from "canvaskit-wasm";

import type { SkRect } from "../types";
import type { SkPictureRecorder } from "../types/Picture/PictureRecorder";

import { HostObject, toValue } from "./Host";
import { JsiSkCanvas } from "./JsiSkCanvas";
import { JsiSkPicture } from "./JsiSkPicture";

export class JsiSkPictureRecorder
  extends HostObject<PictureRecorder, "PictureRecorder">
  implements SkPictureRecorder
{
  constructor(CanvasKit: CanvasKit, ref: PictureRecorder) {
    super(CanvasKit, ref, "PictureRecorder");
  }

  beginRecording(bounds: SkRect) {
    return new JsiSkCanvas(
      this.CanvasKit,
      this.ref.beginRecording(toValue(bounds))
    );
  }

  finishRecordingAsPicture() {
    return new JsiSkPicture(
      this.CanvasKit,
      this.ref.finishRecordingAsPicture()
    );
  }
}
