import type { AnimationValue } from "../types";

import type { BaseAnimation, AnimationState } from "./types";
import { AnimationFactory } from "./animationFactory";

export type EasingInfo = {
  update: (t: number) => number;
  duration: number;
};

type EasingInfoParameters = {
  /**
   * Easing info object that contains duration and an easing function. Defaults to a linear easing
   */
  easing?: EasingInfo;
};

export type DurationInfoParameters = {
  /**
   * The duration of the animation in milliseconds. Defaults to 1000
   */
  duration?: number;
  /**
   * Easing function that will be applied to the animation. Defaults to linear
   */
  easing?: (t: number) => number;
};

export type InterpolatorParams = {
  /**
   * The start value of the animation. Defaults to 0
   */
  from?: number;
  /**
   * The end value of the animation. Defaults to 1
   */
  to?: number;
};

export type InterpolatorFactoryParams = InterpolatorParams &
  (EasingInfoParameters | DurationInfoParameters);

const DefaultParams = {
  from: 0,
  to: 1,
  duration: 1000,
  easing: (t: number) => t,
};

/**
 * Creates an animation that interpolates between two values over a duration of time in milliseconds
 * @param params Configuration of the interpolation
 * @param onAnimationDone Optional callback that will be called when the animation has reaced its duration
 * @returns Animation object
 */
export const InterpolatorAnimationFactory = (
  params: InterpolatorFactoryParams = DefaultParams,
  onAnimationDone?: () => void
): BaseAnimation => {
  const from = params.from ?? DefaultParams.from;
  const to = params.to ?? DefaultParams.to;
  let easing: EasingInfo | ((t: number) => number) =
    params.easing ?? DefaultParams.easing;
  let duration: number;

  // Resolve easing from easing or easing information
  if ("duration" in easing) {
    // eslint-disable-next-line prefer-destructuring
    duration = easing.duration;
    easing = easing.update;
  } else {
    duration =
      "duration" in params
        ? params.duration ?? DefaultParams.duration
        : DefaultParams.duration;
  }

  const config: {
    from: number;
    prevFrom: number | undefined;
    to: number;
    duration: number;
    easing: (t: number) => number;
  } = {
    from,
    prevFrom: undefined,
    to,
    duration,
    easing,
  };

  // Handle setting the from parameter to the start value of the animation
  // if from is not set
  const handleStart = (animationValue: AnimationValue) => {
    if (params?.from === undefined) {
      if (config.prevFrom === undefined) {
        config.from = animationValue.value;
        config.prevFrom = config.from;
      } else {
        config.from = config.prevFrom;
      }
    }
  };

  /**
   * @param timestampSeconds Current timestamp
   * @returns the interpolate value between from and to over the duration of time
   */
  const update = (
    timestampSeconds: number,
    state: AnimationState,
    stop: () => void
  ) => {
    // Repeat / clamping
    const progress = config.easing(
      Math.max(0.0, Math.min(timestampSeconds / config.duration, 1.0))
    );

    // Stop?
    if (timestampSeconds / config.duration >= 1) {
      stop();
      onAnimationDone && onAnimationDone();
    }
    // Interpolate
    return (
      config.from +
      (config.to - config.from) * (state.reverse ? 1 - progress : progress)
    );
  };

  return AnimationFactory(update, handleStart, config.duration);
};
