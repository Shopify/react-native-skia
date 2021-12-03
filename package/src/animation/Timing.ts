import { Easing } from "./Easing";
import { timing } from "./functions";
import { createAnimation } from "./Animation";
import type { TimingAnimationState, TimingConfig } from "./functions/types";
import type { AnimationValue, AnimationFunctionWithState } from "./types";

/**
 * Run a timing animation on the animation value
 * @param animationValue Value to run the animation on
 * @param config Timing configuration
 */
const run = (animationValue: AnimationValue<number>, config: TimingConfig) => {
  return create(animationValue, config).start();
};

/**
 * Creates a timing animation
 * @param animationValue Value to run the animation on
 * @param config Timing configuration
 * @returns Animation
 */
const create = (
  animationValue: AnimationValue<number>,
  config: TimingConfig
) => {
  const state = (): TimingAnimationState => ({
    from: config.from ?? animationValue.value ?? 0,
    to: config.to ?? 1,
    duration: config.duration ?? 1000,
    easing: config.easing ?? ((t: number) => t),
    done: false,
    value: config.from ?? animationValue.value ?? 0,
    startTime: null,
  });

  return createAnimation(
    animationValue,
    timing as AnimationFunctionWithState,
    state
  );
};

export const Timing = {
  Easing,
  create,
  run,
};
