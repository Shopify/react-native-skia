import type { ControllableValue } from "../../types";
import { getResolvedParams } from "../functions/getResolvedParams";
import type { AnimationParams, SpringConfig } from "../types";

import { internalCreateTiming } from "./internalCreateTiming";

/**
 * Creates a new value that will be driven by an animation (clock) value.
 * The value will be run from / to the value in params and modified
 * by the provided easing curve for the length of the duration. When
 * the value has reached its desired "to" value the animation
 * will be stopped.
 *
 * @param toOrParams To value or Animation parameters
 * @param config Spring configuration
 * @params an animation value that can be used to start/stop
 * the animation.
 */
export const createSpring = (
  toOrParams: number | AnimationParams,
  config?: SpringConfig
): ControllableValue => {
  return internalCreateTiming(getResolvedParams(toOrParams, config));
};
