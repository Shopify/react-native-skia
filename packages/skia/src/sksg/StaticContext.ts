import type { Skia, SkPaint } from "../skia/types";

export interface StaticContext {
  paints: SkPaint[];
}

export const createStaticContext = (Skia: Skia) => {
  return { paints: [Skia.Paint()] };
};
