import type { ControllableValue } from "../../types";
import type { AnimationParams, SpringConfig } from "../types";
import { useTiming } from "../timing";

import { Spring } from "./Spring";

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
): ControllableValue => useTiming(toOrParams, config ?? Spring.Config.Default);
