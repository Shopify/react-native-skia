import type { ReactElement } from "react";

import { Skia } from "../skia";

import { SkiaRoot } from "./Reconciler";

export const drawAsImage = (
  element: ReactElement,
  width: number,
  height: number
) =>
  Skia.Surface.drawAsImage(
    (canvas) => {
      const root = new SkiaRoot(Skia);
      root.render(element);
      const paint = Skia.Paint();
      const ctx = {
        canvas,
        paint,
      };
      root.dom.render(ctx);
    },
    width,
    height
  );
