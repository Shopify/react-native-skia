import type { AnimationValue } from "../types";

import type { BaseAnimation, AnimationState } from "./types";
import { BaseAnimationFactory } from "./baseAnimationFactory";

/**
 * Creates an animation that calls the update function
 * with the timestamp in seconds the animation has been running at each step
 * @param update Update function that will be called for each step with
 * the current runtime duration in seconds
 * @param onStart Optional callback that will be called when the animation starts
 * @param duration Optional duration of the animation in milliseconds. If not set,
 * this will be continuously updated
 * @returns Animation object
 */
export const AnimationFactory = (
  update: (
    timestampSeconds: number,
    state: AnimationState,
    stop: () => void
  ) => number = (t) => t,
  onStart?: (animationValue: AnimationValue, state: AnimationState) => void,
  duration?: number
): BaseAnimation => {
  /**
   * @param timestampSeconds Current timestampe in seconds (comes from the SkiaView)
   * @returns the current runtime in seconds from start
   */
  const updateWrapper = (
    timestampSeconds: number,
    state: AnimationState,
    stop: () => void
  ) => {
    if (state.startTime === undefined) {
      state.startTime = timestampSeconds * 1000; // convert to ms
      state.duration = 0;
      return 0;
    }
    if (duration === undefined) {
      state.duration = timestampSeconds * 1000 - state.startTime;
    }
    return update(timestampSeconds * 1000 - state.startTime, state, stop);
  };

  return BaseAnimationFactory(updateWrapper, onStart, duration);
};
