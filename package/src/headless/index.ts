// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CanvasKitInit from "canvaskit-wasm/bin/full/canvaskit";
import type { ReactNode } from "react";

import { JsiSkApi } from "../skia/web";
import { SkiaRoot } from "../renderer/Reconciler";
import { JsiDrawingContext } from "../dom/types";

export * from "../renderer/components";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Skia: any;

export const draw = (element: ReactNode, width: number, height: number) => {
  if (!Skia) {
    Skia = JsiSkApi(CanvasKit);
  }
  const surface = Skia.Surface.MakeOffscreen(width, height);
  if (surface === null) {
    throw new Error("Couldn't create surface!");
  }
  const root = new SkiaRoot(Skia);
  root.render(element);
  const canvas = surface.getCanvas();
  const ctx = new JsiDrawingContext(Skia, canvas);
  root.dom.render(ctx);
  surface.flush();
  const image = surface.makeImageSnapshot();
  return image;
};
