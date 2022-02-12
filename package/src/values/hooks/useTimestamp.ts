import { useEffect, useMemo } from "react";

import { Value } from "../api";
import "../types";

/**
 * @returns A new value that will be updated on every frame redraw with the
 * number of milliseconds elapsed since the value was started.
 * @param immediate - defaults to true. If false, the animation value will be
 * created in the stopped state.
 */
export const useTimestamp = (immediate = true) => {
  const value = useMemo(
    () => Value.createAnimationValue(immediate),
    [immediate]
  );
  useEffect(() => () => value.stop(), [value]);
  return value;
};
