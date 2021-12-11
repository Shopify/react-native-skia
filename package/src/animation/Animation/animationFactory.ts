import type { AnimationValue } from "../types";

import type { BaseAnimation, AnimationState } from "./types";
import { BaseAnimationFactory } from "./baseAnimationFactory";

/**
 * Creates an animation that calls the update function
 * with the total seconds the animation has been running at each step
 * @param update Update function that will be called for each step with
 * the current runtime duration in seconds
 * @param onStart Optional callback that will be called when the animation starts
 * @param durationSeconds Optional duration of the animation in seconds. If not set,
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
  durationSeconds?: number
): BaseAnimation => {
  /**
   * @param timestampSeconds Current timestamp
   * @returns the current runtime in seconds from start
   */
  const updateWrapper = (
    timestampSeconds: number,
    state: AnimationState,
    stop: () => void
  ) => {
    if (state.startTimeSeconds === undefined) {
      state.startTimeSeconds = timestampSeconds;
      state.durationSeconds = 0;
      return 0;
    }
    if (durationSeconds === undefined) {
      state.durationSeconds = timestampSeconds - state.startTimeSeconds;
    }
    return update(timestampSeconds - state.startTimeSeconds, state, stop);
  };

  return BaseAnimationFactory(updateWrapper, onStart, durationSeconds);
};
