import type { SkiaValue } from "../../values/types";
import type {
  SpringConfig,
  AnimationParams,
  AnimationCallback,
} from "../types";
import { useTiming } from "../timing";

import { Spring } from "./Spring";
import { createSpringEasing } from "./createSpringEasing";
import { useMemo } from "react";

/**
 * Creats a spring based animation value that will run whenever
 * the animation parameters change.
 * @param toOrParams
 * @param config
 * @returns
 */
export const useSpring = (
  toOrParams: number | AnimationParams,
  config?: SpringConfig,
  callback?: AnimationCallback
): SkiaValue<number> => {
  const spring = useMemo(
    () => createSpringEasing(config ?? Spring.Config.Default),
    [config]
  );
  return useTiming(toOrParams, spring, callback);
};
