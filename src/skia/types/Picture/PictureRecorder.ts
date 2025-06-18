import type { SkCanvas } from "../Canvas";
import type { SkJSIInstance } from "../JsiInstance";
import type { SkRect } from "../Rect";

import type { SkPicture } from "./Picture";

export interface SkPictureRecorder extends SkJSIInstance<"PictureRecorder"> {
  /**
   * Returns a canvas on which to draw. When done drawing, call finishRecordingAsPicture()
   *
   * @param bounds - a rect to cull the results.
   */
  beginRecording(bounds?: SkRect): SkCanvas;

  /**
   * Returns the captured draw commands as a picture and invalidates the canvas returned earlier.
   */
  finishRecordingAsPicture(): SkPicture;
}
