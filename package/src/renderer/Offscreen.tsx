import type { ReactElement } from "react";

import { JsiDrawingContext } from "../dom/types";
import type { SkPicture, SkSize } from "../skia/types";
import { Skia } from "../skia";

import { SkiaRoot } from "./Reconciler";
import { Platform } from "../Platform";

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

export const drawAsImage = (element: ReactElement, size: SkSize) => {
  return drawAsImageFromPicture(drawAsPicture(element), size);
};

// TODO: We're not sure yet why PixelRatio is not needed here.
const pd = 1;
export const drawAsImageFromPicture = (picture: SkPicture, size: SkSize) => {
  "worklet";
  const surface = Skia.Surface.MakeOffscreen(
    size.width * pd,
    size.height * pd
  )!;
  const canvas = surface.getCanvas();
  canvas.scale(pd, pd);
  canvas.drawPicture(picture);
  surface.flush();
  const image = surface.makeImageSnapshot();
  // If we are not on the UI thread, we need to make the image non-texture.
  // On the web, everything is on the same thread
  if (!_WORKLET && Platform.OS !== "web") {
    image.makeNonTextureImage();
  }
  return image;
};
