import { useEffect, useMemo } from "react";

import { ValueApi } from "../api";
import type { ControllableValue } from "../types";

/**
 * Creates a derived value that is driven from an animation clock. The callback
 * has support for stopping the animation if needed.
 * @param cb Callback to calculate the result value
 * @returns A controllable value that be started/stopped in addition to being a value
 */
export const useAnimationValue = (
  cb: (t: number, stop: () => void) => number
): ControllableValue => {
  const retVal = useMemo(
    () => ValueApi.createAnimationValue(cb, undefined),
    [cb]
  );
  // Auto start/stop
  useEffect(() => {
    retVal.start();
    return () => retVal.stop();
  }, [retVal]);

  return retVal;
};
