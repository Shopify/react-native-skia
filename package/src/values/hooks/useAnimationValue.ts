import { useMemo } from "react";

/**
 * @returns A new animation value that will be updated on every frame redraw.
 * @param startRunning - defaults to true. If false, the animation value will be
 * created in the stopped state.
 */
export const useAnimationValue = (startRunning = true) => {
  return useMemo(
    () => global.SkiaValueApi.createAnimationValue(startRunning),
    [startRunning]
  );
};
