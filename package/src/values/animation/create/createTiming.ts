import { getResolvedParams } from "../functions/getResolvedParams";
import type { AnimationParams, TimingConfig, IAnimation } from "../types";

import { internalCreateTiming } from "./internalCreateTiming";

/**
 * Creates a new value that will be driven by an animation (clock) value.
 * The value will be run from / to the value in params and modified
 * by the provided easing curve for the length of the duration. When
 * the value has reached its desired "to" value the animation
 * will be stopped.
 *
 * @param toOrParams To value or Animation parameters
 * @param config Timing configuration
 * @params an animation value that can be used to start/stop
 * the animation.
 */
export const createTiming = (
  toOrParams: number | AnimationParams,
  config?: TimingConfig
): IAnimation => {
  return internalCreateTiming(getResolvedParams(toOrParams, config));
};
