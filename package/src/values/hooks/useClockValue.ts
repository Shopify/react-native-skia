import { useEffect, useMemo } from "react";

import { ValueApi } from "../api";

/**
 * @deprecated Use Reanimated 3
 * for animating Skia: https://shopify.github.io/react-native-skia/docs/animations/animations
 *
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
