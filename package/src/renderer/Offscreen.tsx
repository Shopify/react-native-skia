import type { ReactElement } from "react";

import { JsiDrawingContext } from "../dom/types";
import type { SkPicture, SkRect, SkSize } from "../skia/types";
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

export const drawAsPicture = (element: ReactElement, bounds?: SkRect) => {
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording(bounds);
  const root = new SkiaRoot(Skia, false);
  root.render(element);
  const ctx = new JsiDrawingContext(Skia, canvas);
  root.dom.render(ctx);
  const picture = recorder.finishRecordingAsPicture();
  root.unmount();
  return picture;
};

export const drawAsImage = (element: ReactElement, size: SkSize) => {
  return drawAsImageFromPicture(drawAsPicture(element), size);
};

// Offscreen there is no notion of pixel density
// However, some users might be confused when using useTexture, using dimensions in points not pixels
// If we were to do the scaling here, APIs that textures as input (e.g Atlas)
// would need to adapt to the pixel density
// We are not sure yet if the APIs could be more ergonomic there
// We could also in the case of Atlas set the default matrix to scale by the pixel density
// Other some other texture sources like Images have only pixel dimensions
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
  // If we are not on the main thread or if we are on Web, we need to make the image non-texture.
  if (!isOnMainThread() || Platform.OS === "web") {
    return image.makeNonTextureImage();
  } else {
    return image;
  }
};
