// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CanvasKitInit from "canvaskit-wasm/bin/full/canvaskit";
import type { ReactNode } from "react";

import { JsiSkApi } from "../skia/web";
import { SkiaRoot } from "../renderer/Reconciler";
import { JsiDrawingContext } from "../dom/types";
import type { SkSurface } from "../skia";

export * from "../renderer/components";

let Skia: ReturnType<typeof JsiSkApi>;

export const makeOffscreenSurface = (width: number, height: number) => {
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
  return { Skia };
};

export const drawOffscreen = (surface: SkSurface, element: ReactNode) => {
  const root = new SkiaRoot(Skia, false);
  root.render(element);
  const canvas = surface.getCanvas();
  const ctx = new JsiDrawingContext(Skia, canvas);
  root.dom.render(ctx);
  root.unmount();
  surface.flush();
  return surface.makeImageSnapshot();
};
