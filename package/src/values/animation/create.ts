import type { IValue } from "../types";
import { Value } from "../Values";

import { getResolvedParams } from "./params";
import { timing } from "./timing";
import type {
  AnimationParams,
  TimingConfig,
  SpringConfig,
  IAnimation,
} from "./types";

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
): IAnimation => {
  return internalCreateTiming(getResolvedParams(toOrParams, config));
};

/**
 * Creates a new value that will be driven by an animation (clock) value.
 * The value will be run from / to the value in params and modified
 * by the provided easing curve for the length of the duration. When
 * the value has reached its desired "to" value the animation
 * will be stopped.
 *
 * @param params Animation parameters
 * @param config Spring or timing configuration
 * @param value Optional value that the animation will update
 * @params an animation value that can be used to start/stop
 * the animation.
 */
export const internalCreateTiming = (
  params: Required<AnimationParams> & Required<TimingConfig>,
  value?: IValue<number>
): IAnimation => {
  // Create driver value
  const driver = Value.createAnimationValue(params.immediate);
  // Create the animation value
  const resolvedValue = value ?? Value.createValue(params.from);

  // Set the driver on the value
  const updateFunction = (t: number) => {
    const p = timing(
      t,
      params.duration,
      params.easing,
      params.loop ?? false,
      params.yoyo ?? false,
      () => {
        // Animation has reached its duration and to value
        resolvedValue.setDriver(undefined);
        driver.stop();
      }
    );
    return p * (params.to - params.from) + params.from;
  };

  resolvedValue.setDriver(driver, updateFunction);

  const seek = (t: number) => {
    driver.stop();
    const nextValue = updateFunction(t * params.duration);
    const tmpValue = Value.createValue(nextValue);
    resolvedValue.setDriver(tmpValue);
    tmpValue.value = nextValue;
  };

  const stop = () => {
    resolvedValue.setDriver(undefined);
    driver.stop();
  };

  const start = () => {
    resolvedValue.setDriver(driver, updateFunction);
    driver.start();
  };

  return {
    value: resolvedValue,
    stop,
    start,
    seek,
  };
};
