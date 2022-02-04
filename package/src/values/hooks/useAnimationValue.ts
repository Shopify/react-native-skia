import { useMemo } from "react";

/**
 * @returns A new animation value that will be updated on every frame redraw.
 */
export const useAnimationValue = () => {
  return useMemo(() => global.SkiaValueApi.createAnimationValue(), []);
};
