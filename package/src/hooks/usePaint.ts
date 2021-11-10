import type { DependencyList } from "react";
import { useMemo } from "react";

import type { IPaint } from "../skia/Paint";
import { Api } from "../skia/Api";

/**
 * Returns a Skia Paint object
 * */
export const usePaint = (
  initializer?: (path: IPaint) => void,
  deps?: DependencyList
) =>
  useMemo(() => {
    const p = Api.Paint();
    p.antialias = true;
    if (initializer) {
      initializer(p);
    }
    return p;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
