import type { AnimationValue } from "../types";

import type { BaseAnimation, AnimationState } from "./types";

/**
 * Creates a base animation that calls the provided update function at each step
 * @param update Update function that will be called for each step with the current timestamp in seconds
 * @param onStart Called when the animation starts
 * @param durationSeconds optional duration of the animation in seconds. If not set,
 * the duration will be calculated.
 * @returns Animation object
 */
export const BaseAnimationFactory = (
  update: (
    timestampSeconds: number,
    state: AnimationState,
    stop: () => void
  ) => number,
  onStart?: (animationValue: AnimationValue, state: AnimationState) => void,
  durationSeconds?: number
): BaseAnimation => {
  const state: AnimationState = {
    startTimeSeconds: undefined,
    currentValue: undefined,
    durationSeconds: durationSeconds,
  };

  const updateWrapper = (timestampSeconds: number) => {
    return update(timestampSeconds, state, stop);
  };

  /**
   * Starts the animation on the current animation value
   * @param animationValue
   */
  const start = (animationValue: AnimationValue) => {
    state.currentValue = animationValue;
    state.currentValue.startAnimation(updateWrapper);
    onStart && onStart(state.currentValue, state);
  };

  /**
   * Stops the animation
   */
  const stop = () => {
    state.currentValue?.stopAnimation(updateWrapper);
    state.currentValue = undefined;
  };

  return {
    start,
    update: updateWrapper,
    stop,
    durationSeconds: () => state.durationSeconds ?? 0,
  };
};
