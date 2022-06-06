import type { DependencyList } from "react";
import { useMemo } from "react";

import { Skia } from "../Skia";
import type { SkCanvas, SkPicture, SkRect } from "../types";

/**
 * Memoizes and returns an SkPicture that can be drawn to another canvas.
 * @param rect Picture bounds
 * @param cb Callback for drawing to the canvas
 * @returns SkPicture
 */
export const usePicture = (
  rect: SkRect,
  cb: (canvas: SkCanvas) => void,
  deps: DependencyList = []
): SkPicture => {
  return useMemo(() => {
    const recorder = Skia.PictureRecorder();
    const canvas = recorder.beginRecording(rect);
    cb(canvas);
    return recorder.finishRecordingAsPicture();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cb, rect, deps]);
};
