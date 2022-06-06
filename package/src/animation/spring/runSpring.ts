import type { SkiaMutableValue, SkiaAnimation } from "../../values/types";
import type {
  AnimationParams,
  SpringConfig,
  AnimationCallback,
} from "../types";
import { runTiming } from "../timing/runTiming";

import { Spring } from "./Spring";
import { createSpringEasing } from "./functions/spring";

/**
 * Creates a new animation on an existing value that will be driven by
 * an animation value. The value will be run from / to the value in
 * params and modified by the provided easing curve for the length of
 * the duration. When the value has reached its desired "to" value the
 * animation will be stopped.
 *
 * @param value The value to animate
 * @param toOrParams To value or Animation parameters
 * @param config Spring configuration
 * @returns an animation value that can be used to start/stop
 * the animation.
 */
export const runSpring = (
  value: SkiaMutableValue<number>,
  toOrParams: number | AnimationParams,
  config?: SpringConfig,
  callback?: AnimationCallback
): SkiaAnimation => {
  return runTiming(
    value,
    toOrParams,
    createSpringEasing(config ?? Spring.Config.Default),
    callback
  );
};
