import type { SkiaReadonlyValue } from "../../types";
import type { SpringConfig, TimingParams, AnimationCallback } from "../types";
import { useTiming } from "../timing";

import { Spring } from "./Spring";
import { createSpringEasing } from "./functions/spring";

/**
 * Creats a spring based animation value that will run whenever
 * the animation parameters change.
 * @param toOrParams
 * @param config
 * @returns
 */
export const useSpring = (
  toOrParams: number | TimingParams,
  config?: SpringConfig,
  callback?: AnimationCallback
): SkiaReadonlyValue<number> =>
  useTiming(
    toOrParams,
    createSpringEasing(config ?? Spring.Config.Default),
    callback
  );
