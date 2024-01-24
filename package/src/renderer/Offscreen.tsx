import type { ReactElement } from "react";

import { JsiDrawingContext } from "../dom/types";
import { Skia } from "../skia";

import { SkiaRoot } from "./Reconciler";

export const drawAsImage = (
  element: ReactElement,
  width: number,
  height: number
) => {
  const picture = drawAsPicture(element);
  const surface = Skia.Surface.MakeOffscreen(width, height);
  if (!surface) {
    throw new Error("Could not create offscreen surface");
  }
  const canvas = surface.getCanvas();
  canvas.drawPicture(picture);
  surface.flush();
  return surface.makeImageSnapshot();
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
