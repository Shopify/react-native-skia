// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

import { JsiSkApi } from "../skia/web";
import { SkiaSGRoot } from "../sksg/Reconciler";
export * from "../renderer/components";
export * from "../skia/types";
let Skia;
export const makeOffscreenSurface = (width, height) => {
  if (!Skia) {
    Skia = JsiSkApi(CanvasKit);
  }
  const surface = Skia.Surface.MakeOffscreen(width, height);
  if (surface === null) {
    throw new Error("Couldn't create surface!");
  }
  return surface;
};
export const getSkiaExports = () => {
  if (!Skia) {
    Skia = JsiSkApi(CanvasKit);
  }
  return {
    Skia
  };
};
export const drawOffscreen = (surface, element) => {
  const root = new SkiaSGRoot(Skia);
  root.render(element);
  const canvas = surface.getCanvas();
  root.drawOnCanvas(canvas);
  root.unmount();
  surface.flush();
  return surface.makeImageSnapshot();
};
//# sourceMappingURL=index.js.map