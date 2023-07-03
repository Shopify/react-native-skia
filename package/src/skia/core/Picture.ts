import { Skia } from "../Skia";
import type { SkCanvas, SkRect } from "../types";

/**
 * Memoizes and returns an SkPicture that can be drawn to another canvas.
 * @param rect Picture bounds
 * @param cb Callback for drawing to the canvas
 * @returns SkPicture
 */
export const createPicture = (rect: SkRect, cb: (canvas: SkCanvas) => void) => {
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording(rect);
  cb(canvas);
  return recorder.finishRecordingAsPicture();
};
