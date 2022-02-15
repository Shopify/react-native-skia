import type { Value } from "../../types";
import type { AnimationParams, TimingConfig } from "../types";

import { useInternalTiming } from "./useInternalTiming";

/**
 * Creats a timing based animation value that will run whenever
 * the animation parameters change.
 * @param toOrParams
 * @param config
 * @returns
 */
export const useTiming = (
  toOrParams: number | AnimationParams,
  config?: TimingConfig
): Value<number> => useInternalTiming(toOrParams, config);
