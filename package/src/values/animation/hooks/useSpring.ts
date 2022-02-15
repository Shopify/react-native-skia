import type { Value } from "../../types";
import type { AnimationParams, SpringConfig } from "../types";
import { Spring } from "../Spring";

import { useInternalTiming } from "./useInternalTiming";

/**
 * Creats a spring based animation value that will run whenever
 * the animation parameters change.
 * @param toOrParams
 * @param config
 * @returns
 */
export const useSpring = (
  toOrParams: number | AnimationParams,
  config?: SpringConfig
): Value<number> =>
  useInternalTiming(toOrParams, config ?? Spring.Config.Default);
