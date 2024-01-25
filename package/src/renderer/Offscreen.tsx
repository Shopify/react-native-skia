import type { ReactElement } from "react";

import { JsiDrawingContext } from "../dom/types";
import type { SkPicture, SkSize } from "../skia/types";
import { Skia } from "../skia";

import { SkiaRoot } from "./Reconciler";

export const drawAsPicture = (element: ReactElement) => {
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording();
  const root = new SkiaRoot(Skia, false);
  root.render(element);
  const ctx = new JsiDrawingContext(Skia, canvas);
  root.dom.render(ctx);
  const picture = recorder.finishRecordingAsPicture();
  return picture;
};

export const createTexture = (element: ReactElement, size: SkSize) => {
  return createTextureFromPicture(drawAsPicture(element), size);
};

// TODO: We're not sure yet why PixelRatio is not needed here.
const pd = 1;
export const createTextureFromPicture = (picture: SkPicture, size: SkSize) => {
  "worklet";
  const surface = Skia.Surface.MakeOffscreen(
    size.width * pd,
    size.height * pd
  )!;
  const canvas = surface.getCanvas();
  canvas.drawPicture(picture);
  surface.flush();
  return surface.makeImageSnapshot();
};

// We keep this function for backward compatibility.
export const drawAsImage = (
  element: ReactElement,
  width: number,
  height: number
) => {
  return createTexture(element, { width, height });
};
