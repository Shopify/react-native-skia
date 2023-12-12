import { Skia } from "../Skia";
import { isRect, type SkCanvas, type SkRect, type SkSize } from "../types";

/**
 * Memoizes and returns an SkPicture that can be drawn to another canvas.
 * @param rect Picture bounds
 * @param cb Callback for drawing to the canvas
 * @returns SkPicture
 */
export const createPicture = (
  cb: (canvas: SkCanvas) => void,
  rect?: SkRect | SkSize
) => {
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording(
    // eslint-disable-next-line no-nested-ternary
    rect
      ? isRect(rect)
        ? rect
        : Skia.XYWHRect(0, 0, rect.width, rect.height)
      : undefined
  );
  cb(canvas);
  return recorder.finishRecordingAsPicture();
};
