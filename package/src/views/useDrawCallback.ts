import type { DependencyList } from "react";
import { useMemo } from "react";

import type { RNSkiaDrawCallback } from "../views";

/**
 * Creates a memoized callback for the onDraw handler of a Skia component.
 * @param callback The callback to memoize.
 * @param deps Dependencies for the callback.
 * */
export const useDrawCallback = (
  callback: RNSkiaDrawCallback,
  deps: DependencyList | undefined = []
) => {
  return useMemo(() => {
    return callback;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, ...deps]);
};