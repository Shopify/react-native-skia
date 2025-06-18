import { Skia } from "../skia";
import { Platform } from "../Platform";
import { SkiaSGRoot } from "../sksg/Reconciler";

// We call it main thread because on web main is JS thread
export const isOnMainThread = () => {
  "worklet";

  return typeof _WORKLET !== "undefined" && _WORKLET === true || Platform.OS === "web";
};
export const drawAsPicture = (element, bounds) => {
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording(bounds);
  const root = new SkiaSGRoot(Skia);
  root.render(element);
  root.drawOnCanvas(canvas);
  const picture = recorder.finishRecordingAsPicture();
  root.unmount();
  return picture;
};
export const drawAsImage = (element, size) => {
  return drawAsImageFromPicture(drawAsPicture(element), size);
};
export const drawAsImageFromPicture = (picture, size) => {
  "worklet";

  const surface = Skia.Surface.MakeOffscreen(size.width, size.height);
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
//# sourceMappingURL=Offscreen.js.map