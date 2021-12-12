import type { AnimationValue } from "../types";

import type { BaseAnimation, AnimationState } from "./types";

/**
 * Creates a base animation that calls the provided update function at each step
 * @param update Update function that will be called for each step with the current timestamp in seconds
 * @param onStart Called when the animation starts
 * @param Seconds optional duration of the animation in milliseconds. If not set,
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
  duration?: number
): BaseAnimation => {
  const state: AnimationState = {
    startTime: undefined,
    currentValue: undefined,
    onAnimationDone: undefined,
    duration,
    reverse: false,
  };

  const updateWrapper = (timestampSeconds: number) => {
    return update(timestampSeconds, state, stop);
  };

  const startInternal = (animationValue: AnimationValue) => {
    state.startTime = undefined;
    const retVal = new Promise<void>((resolve) => {
      state.onAnimationDone = resolve;
    });

    state.currentValue = animationValue;
    state.currentValue?.startAnimation(updateWrapper, state.onAnimationDone);
    // Call onStart to let children calculate from values
    onStart && onStart(state.currentValue, state);
    // Return promise that resolves when animation is done
    return retVal;
  };

  /**
   * Starts the animation reversed
   * @param animationValue
   * @returns A promise that will be resolved when the animation is done.
   */
  const reverse = (animationValue: AnimationValue): Promise<void> => {
    state.reverse = true;
    return startInternal(animationValue);
  };

  /**
   * Starts the animation on the current animation value
   * @param animationValue
   * @returns A promise that will be resolved when the animation is done.
   */
  const start = (animationValue: AnimationValue) => {
    state.reverse = false;
    return startInternal(animationValue);
  };

  /**
   * Stops the animation
   */
  const stop = () => {
    state.currentValue?.stopAnimation(updateWrapper);
    state.currentValue = undefined;
    state.onAnimationDone && state.onAnimationDone();
    state.onAnimationDone = undefined;
  };

  return {
    start,
    reverse,
    update: updateWrapper,
    stop,
    duration: () => state.duration ?? 0,
  };
};
