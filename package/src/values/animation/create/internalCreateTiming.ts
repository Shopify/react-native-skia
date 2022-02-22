import type { Value, ControllableValue } from "../../types";
import { ValueApi } from "../../api";
import type { RequiredAnimationParams } from "../functions/getResolvedParams";
import { timing } from "../functions/timing";
import type { TimingConfig } from "../types";

/**
 * Creates an animation value that is driven by a clock value.
 * The value will be run from / to the value in params and modified
 * by the provided easing curve for the length of the duration. When
 * the value has reached its desired "to" value the animation
 * will be stopped. If loop is set to true, the animation will continue
 * to run until stopped.
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
): ControllableValue => {
  // Update from to be either the declared from value,
  // the current value of the value or zero
  const from = params.from ?? value?.value ?? 0;

  // Update function for the animation value
  const updateFunction = (t: number, stop: () => void) => {
    if (params.to === from) {
      stop();
    }
    const p = timing(
      t,
      params.duration,
      params.easing,
      params.loop ?? false,
      params.yoyo ?? false,
      stop
    );
    return p * (params.to - from!) + from!;
  };

  // Create animation value
  return ValueApi.createAnimationValue(updateFunction, value);
};
