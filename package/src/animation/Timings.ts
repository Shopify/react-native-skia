import { Easing } from "./Easing";
import { timing } from "./functions";
import { createAnimation } from "./createAnimation";
import type { TimingAnimationState, TimingConfig } from "./functions/types";
import type { AnimationValue } from "./types";

/**
 * Run a timing animation on the animation value
 * @param animationValue Value to run the animation
 * @param config Timing configuration
 */
const run = (animationValue: AnimationValue<number>, config: TimingConfig) => {
  const state: TimingAnimationState = {
    from: config.from ?? animationValue.value ?? 0,
    to: config.to ?? 1,
    duration: config.duration ?? 1000,
    easing: config.easing ?? ((t: number) => t),
    done: false,
    value: 0,
    startTime: null,
  };

  createAnimation(animationValue, timing, state);
};

export const Timings = {
  Easing,
  run,
};
