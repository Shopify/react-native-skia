import type { IAnimationValue, IValue } from "../types";
import { Value } from "../Values";

import { getResolvedParams } from "./params";
import { timing } from "./timing";
import type { AnimationParams, TimingConfig, SpringConfig } from "./types";

/**
 * Creates a new animation on an existing value that will be driven by
 * an animation value. The value will be run from / to the value in
 * params and modified by the provided easing curve for the length of
 * the duration. When the value has reached its desired "to" value the
 * animation will be stopped.
 *
 * @param value The value to animate
 * @param toOrParams To value or Animation parameters
 * @param config Timing configuration
 * @returns an animation value that can be used to start/stop
 * the animation.
 */
export const runTiming = (
  value: IValue<number>,
  toOrParams: number | AnimationParams,
  config?: TimingConfig
): IAnimationValue => {
  const resolvedParams = getResolvedParams(toOrParams, config);
  return internalRunTiming(value, resolvedParams);
};

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
  value: IValue<number>,
  toOrParams: number | AnimationParams,
  config?: SpringConfig
): IAnimationValue => {
  const resolvedParams = getResolvedParams(toOrParams, config);
  return internalRunTiming(value, resolvedParams);
};

/**
 * Creates a new animation on an existing value that will be driven by
 * an animation value. The value will be run from / to the value in
 * params and modified by the provided easing curve for the length of
 * the duration. When the value has reached its desired "to" value the
 * animation will be stopped.
 *
 * @param value The value to animate
 * @param toOrParams To value or Animation parameters
 * @param config Spring or timing configuration
 * @returns an animation value that can be used to start/stop
 * the animation.
 */
export const internalRunTiming = (
  value: IValue<number>,
  params: Required<AnimationParams> & Required<TimingConfig>
): IAnimationValue => {
  // Make sure we'll start at the current value
  const resolvedParameters = { ...params };
  resolvedParameters.from = value.value;

  // Create driver value
  const driver = Value.createAnimationValue(resolvedParameters.immediate);

  // Stop any existing animations on the value
  const prevDriver = value.getDriver();
  if (prevDriver && "stop" in prevDriver) {
    (prevDriver as IAnimationValue).stop();
  }

  // Set the driver on the value
  value.setDriver(driver, (t: number) => {
    const p = timing(
      t,
      resolvedParameters.duration,
      resolvedParameters.easing,
      resolvedParameters.loop,
      resolvedParameters.yoyo,
      () => {
        // Animation has reached its duration and "to" value
        // And is not looping
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
    stop: () => {
      value.setDriver(undefined);
      driver.stop();
    },
    start: driver.start,
  };
};
