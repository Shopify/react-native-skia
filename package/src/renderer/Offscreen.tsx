import type { ReactElement } from "react";

import { JsiDrawingContext } from "../dom/types";
import { Skia } from "../skia";

import { SkiaRoot } from "./Reconciler";

export const drawAsImage = (
  element: ReactElement,
  width: number,
  height: number
) => {
  const surface = Skia.Surface.MakeOffscreen(width, height);
  if (!surface) {
    throw new Error("Could not create offscreen surface");
  }
  const canvas = surface.getCanvas();
  const root = new SkiaRoot(Skia);
  root.render(element);
  const ctx = new JsiDrawingContext(Skia, canvas);
  root.dom.render(ctx);
  surface.flush();
  return surface.makeImageSnapshot();
};
