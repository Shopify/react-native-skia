import { useEffect, useMemo } from "react";

import { ValueApi } from "../api";
import "../types";

/**
 * @returns A new value that will be updated on every frame redraw with the
 * number of milliseconds elapsed since the value was started.
 * The clock is created in the stopped state.
 */

export const useClockValue = () => {
  const value = useMemo(() => ValueApi.createAnimationValue((t) => t), []);
  useEffect(() => {
    value.start();
    return () => value.stop();
  }, [value]);

  return value;
};
