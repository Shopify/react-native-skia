import type { AnimationValue, AnimationFunctionWithState } from "./types";
import type { SpringConfig, SpringAnimationState } from "./functions";
import { spring } from "./functions";
import { createAnimation } from "./Animation";

export interface SpringParams {
  from?: number;
  to?: number;
  config?: SpringConfig;
}

/**
 * Starts a spring animation where the animationValue will be updated with the
 * current value of the spring function with the spring parameters.
 * @param animationValue Value to be updated
 * @param params Spring parameters
 * @returns A function that can be called from the drawing loop
 */
const run = (animationValue: AnimationValue<number>, params: SpringParams) => {
  return create(animationValue, params).start();
};

/**
 * Creates a spring animation where the animationValue will be updated with the
 * current value of the spring function with the spring parameters.
 * @param animationValue Value to be updated
 * @param params Spring parameters
 * @returns A function that can be called from the drawing loop
 */
export const create = (
  animationValue: AnimationValue<number>,
  params: SpringParams
) => {
  const state: SpringAnimationState = {
    from: params?.from ?? animationValue.value ?? 0,
    to: params?.to ?? 1,
    config: {
      restDisplacementThreshold: 0.005,
      restSpeedThreshold: 0.001,
      damping: 10,
      mass: 1,
      stiffness: 100,
      overshootClamping: false,
      velocity: 0,
      ...params?.config,
    },
    done: false,
    value: params.from ?? animationValue.value ?? 0,
    lastTimestamp: 0,
  };

  return createAnimation(
    animationValue,
    spring as AnimationFunctionWithState,
    state
  );
};

export const Springs = {
  run,
  create,
  Spring: (config: SpringConfig = {}) => ({
    mass: 1,
    stiffness: 100,
    damping: 26,
    ...config,
  }),
  Gentle: (config: SpringConfig = {}) => ({
    mass: 1,
    stiffness: 170,
    damping: 19,
    ...config,
  }),
  Wobbly: (config: SpringConfig = {}) => ({
    mass: 1,
    stiffness: 180,
    damping: 12,
    ...config,
  }),
  WobblySlow: (config: SpringConfig = {}) => ({
    mass: 4,
    stiffness: 180,
    damping: 25,
    ...config,
  }),
  Stiff: (config: SpringConfig = {}) => ({
    mass: 1,
    stiffness: 200,
    damping: 20,
    ...config,
  }),
  Default: (config: SpringConfig = {}) => ({
    mass: 1,
    stiffness: 100,
    damping: 10,
    ...config,
  }),
};
