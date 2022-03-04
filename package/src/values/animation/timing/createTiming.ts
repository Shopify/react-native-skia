import type { TimingConfig, RequiredAnimationParams } from "../types";
import type { AnimationState, SkiaValue } from "../../types";
import { ValueApi } from "../../api";

import { timing } from "./functions";

/**
 * Creates an animation that is driven by a clock value.
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
export const createTiming = (
  params: RequiredAnimationParams & Required<TimingConfig>,
  value?: SkiaValue<number>
) => {
  // Update from to be either the declared from value,
  // the current value of the value or zero
  const resolvedParams = {
    ...params,
    from: params.from ?? value?.value ?? 0,
  };

  // Update function for the animation value
  const animationFunction = (t: number, state: AnimationState | undefined) => {
    // Update the input value using the provided update function
    const nextState = timing(
      t,
      params.duration,
      params.easing,
      params.loop ?? false,
      params.yoyo ?? false,
      state ?? { current: params.from!, finished: false }
    );

    return {
      ...nextState,
      current:
        // Interpolate value
        nextState.current * (resolvedParams.to - resolvedParams.from!) +
        resolvedParams.from!,
    };
  };

  // Create animation value
  return ValueApi.createAnimation(animationFunction);
};
