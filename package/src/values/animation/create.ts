import type { IAnimationValue } from "../types";
import { Value } from "../Values";

import { getResolvedParams } from "./params";
import { timing } from "./timing";
import type { AnimationParams, TimingConfig, SpringConfig } from "./types";

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
): IAnimationValue => {
  return internalCreateTiming(toOrParams, config);
};

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
): IAnimationValue => {
  return internalCreateTiming(toOrParams, config);
};

/**
 * Creates a new value that will be driven by an animation (clock) value.
 * The value will be run from / to the value in params and modified
 * by the provided easing curve for the length of the duration. When
 * the value has reached its desired "to" value the animation
 * will be stopped.
 *
 * @param toOrParams To value or Animation parameters
 * @param config Spring or timing configuration
 * @params an animation value that can be used to start/stop
 * the animation.
 */
export const internalCreateTiming = (
  toOrParams: number | AnimationParams,
  config?: TimingConfig | SpringConfig
): IAnimationValue => {
  // Resolve parameters
  const resolvedParameters = getResolvedParams(toOrParams, config);
  // Create driver value
  const driver = Value.createAnimationValue(resolvedParameters.immediate);
  // Create the animation value
  const value = Value.createValue(resolvedParameters.from);

  // Set the driver on the value
  value.setDriver(driver, (t: number) => {
    const p = timing(
      t,
      resolvedParameters.duration,
      resolvedParameters.easing,
      resolvedParameters.loop ?? false,
      resolvedParameters.yoyo ?? false,
      () => {
        // Animation has reached its duration and to value
        value.setDriver(undefined);
        driver.stop();
      }
    );
    return (
      p * (resolvedParameters.to - resolvedParameters.from) +
      resolvedParameters.from
    );
  });

  return {
    ...value,
    stop: driver.stop,
    start: driver.start,
  };
};
