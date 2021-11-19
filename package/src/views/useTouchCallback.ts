import type { DependencyList } from "react";
import { useMemo } from "react";

import type { RNSkiaTouchCallback } from "../views";

/**
 * Creates a memoized callback for the onDraw handler of a Skia component.
 * @param callback The callback to memoize.
 * @param deps Dependencies for the callback.
 * */
export const useTouchCallback = (
  callback: RNSkiaTouchCallback,
  deps: DependencyList | undefined = []
) => {
  return useMemo(() => {
    return callback;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, ...deps]);
};