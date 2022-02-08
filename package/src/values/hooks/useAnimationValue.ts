import { useMemo } from "react";
import "../types";

/**
 * @returns A new animation value that will be updated on every frame redraw.
 * @param immediate - defaults to true. If false, the animation value will be
 * created in the stopped state.
 */
export const useAnimationValue = (immediate = true) => {
  return useMemo(
    () => global.SkiaValueApi.createAnimationValue(immediate),
    [immediate]
  );
};
