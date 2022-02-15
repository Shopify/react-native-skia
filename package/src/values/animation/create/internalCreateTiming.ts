import type { Value } from "../../types";
import { ValueApi } from "../../api";
import type { RequiredAnimationParams } from "../functions/getResolvedParams";
import { timing } from "../functions/timing";
import type { TimingConfig, IAnimation } from "../types";

import type { INativeValue } from "./types";

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
  params: RequiredAnimationParams & Required<TimingConfig>,
  value?: Value<number>
): IAnimation => {
  // Create driver value
  const driver = ValueApi.createClockValue(params.immediate);
  // Create the animation value
  const resolvedValue = (value ??
    ValueApi.createValue(params.from ?? 0)) as INativeValue;
  // Update from
  params.from = params.from ?? resolvedValue.value;
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
        resolvedValue._setDriver(undefined);
        driver.stop();
      }
    );
    return p * (params.to - params.from!) + params.from!;
  };

  resolvedValue._setDriver(driver, updateFunction);

  const stop = () => {
    resolvedValue._setDriver(undefined);
    driver.stop();
  };

  const start = () => {
    resolvedValue._setDriver(driver, updateFunction);
    driver.start();
  };

  return {
    stop,
    start,
  };
};
