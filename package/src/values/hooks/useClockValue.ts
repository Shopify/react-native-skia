import { useEffect, useMemo } from "react";

import { ValueApi } from "../api";

/**
 * @returns A new value that will be updated on every frame redraw with the
 * number of milliseconds elapsed since the value was started.
 * The clock is created in the stopped state.
 */

export const useClockValue = () => {
  const clock = useMemo(() => ValueApi.createClockValue(), []);
  useEffect(() => {
    clock.start();
    return clock.stop;
  }, [clock]);
  return clock;
};
