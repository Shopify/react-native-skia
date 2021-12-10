import { Easing } from "./Easing";
import { timing } from "./functions";
import { createAnimation } from "./Animation";
import type { AnimationState, TimingConfig } from "./functions/types";
import type { AnimationValue } from "./types";

/**
 * Creats and starts a timing animation on the provided animation value
 * @param animationValue Value to run the animation on
 * @param config Timing configuration
 */
const run = (animationValue: AnimationValue<number>, config: TimingConfig) => {
  return create(config).start(animationValue);
};

/**
 * Creates a timing animation
 * @param config Timing configuration
 * @returns Animation
 */
const create = (config: TimingConfig = {}) => {
  const stateFactory = (currentValue: number): AnimationState => ({
    from: config.from ?? currentValue ?? 0,
    to: config.to ?? 1,
    duration: config.duration ?? 1000,
    easing: config.easing ?? ((t: number) => t),
    done: false,
    value: config.from ?? currentValue ?? 0,
    startTime: null,
  });

  return createAnimation(timing, stateFactory);
};

export const Timing = {
  Easing,
  create,
  run,
};
