import type { ReactElement } from "react";

import { JsiDrawingContext } from "../dom/types";
import type { SkPicture, SkSize } from "../skia/types";
import { Skia } from "../skia";
import { Platform } from "../Platform";

import { SkiaRoot } from "./Reconciler";

// We call it main thread because on web main is JS thread
export const isOnMainThread = () => {
  "worklet";
  return (
    (typeof _WORKLET !== "undefined" && _WORKLET === true) ||
    Platform.OS === "web"
  );
};

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
  // If we are not on the main thread, we need to make the image non-texture.
  if (!isOnMainThread()) {
    return image.makeNonTextureImage();
  } else {
    return image;
  }
};
