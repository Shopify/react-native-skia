import type { DependencyList } from "react";
import { useMemo } from "react";

import { Skia } from "../Skia";
import type { SkPaint } from "../types";

export const SkiaPaint = () => {
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  return paint;
};
/**
 * Returns a Skia Paint object
 * */
export const usePaint = (
  initializer?: (paint: SkPaint) => void,
  deps?: DependencyList
) =>
  useMemo(() => {
    const p = SkiaPaint();
    if (initializer) {
      initializer(p);
    }
    return p;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
