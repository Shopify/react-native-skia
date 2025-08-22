import type { ReactElement } from "react";

import type { SkPicture, SkRect, SkSize } from "../skia/types";
import { Skia } from "../skia";
import { Platform } from "../Platform";
import { SkiaSGRoot } from "../sksg/Reconciler";

// We call it main thread because on web main is JS thread
export const isOnMainThread = () => {
  "worklet";
  // Check if we're on the UI thread (worklet context)
  // In Reanimated 4, worklets can be detected via global object
  const isWorklet =
    typeof global !== "undefined" &&
    (global as { _WORKLET?: boolean })._WORKLET === true;
  return !isWorklet || Platform.OS === "web";
};

export const drawAsPicture = async (element: ReactElement, bounds?: SkRect) => {
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording(bounds);
  const root = new SkiaSGRoot(Skia);
  await root.render(element);
  root.drawOnCanvas(canvas);
  const picture = recorder.finishRecordingAsPicture();
  root.unmount();
  return picture;
};

export const drawAsImage = async (element: ReactElement, size: SkSize) => {
  return drawAsImageFromPicture(await drawAsPicture(element), size);
};

export const drawAsImageFromPicture = (picture: SkPicture, size: SkSize) => {
  "worklet";
  const surface = Skia.Surface.MakeOffscreen(size.width, size.height)!;
  const canvas = surface.getCanvas();
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
