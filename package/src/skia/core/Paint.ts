import type { DependencyList } from "react";
import { useMemo } from "react";

import { Skia } from "../Skia";
import type { SkPaint } from "../types";

/**
 * Returns a Skia Paint object
 * */
export const usePaint = (
  initializer?: (paint: SkPaint) => void,
  deps?: DependencyList
) =>
  useMemo(() => {
    const p = Skia.Paint();
    if (initializer) {
      initializer(p);
    }
    return p;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
