import { Skia } from "../Skia";
import { isRect, type SkCanvas, type SkRect, type SkSize } from "../types";

/**
 * Memoizes and returns an SkPicture that can be drawn to another canvas.
 * @param rect Picture bounds
 * @param cb Callback for drawing to the canvas
 * @returns SkPicture
 */
export const createPicture = (
  rect: SkRect | SkSize,
  cb: (canvas: SkCanvas) => void
) => {
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording(
    isRect(rect) ? rect : Skia.XYWHRect(0, 0, rect.width, rect.height)
  );
  cb(canvas);
  return recorder.finishRecordingAsPicture();
};
