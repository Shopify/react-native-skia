import { Skia } from "../Skia";
import { isRect } from "../types";

/**
 * Memoizes and returns an SkPicture that can be drawn to another canvas.
 * @param rect Picture bounds
 * @param cb Callback for drawing to the canvas
 * @returns SkPicture
 */
export const createPicture = (cb, rect) => {
  "worklet";

  const recorder = Skia.PictureRecorder();
  let bounds;
  if (rect) {
    bounds = isRect(rect) ? rect : Skia.XYWHRect(0, 0, rect.width, rect.height);
  }
  const canvas = recorder.beginRecording(bounds);
  cb(canvas);
  return recorder.finishRecordingAsPicture();
};
//# sourceMappingURL=Picture.js.map